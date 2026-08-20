import { User, AuthSession } from "@/types/property";
import { supabase } from "./supabase";

// ============================================================================
// SUPABASE ONLY - NO LOCALSTORAGE FALLBACK
// ============================================================================

export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<{ success: boolean; message: string; user?: User; session?: AuthSession }> {
  try {
    console.log("=== REGISTRATION START ===");
    console.log("Username:", userData.username);
    console.log("Email:", userData.email);

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.name,
          phone: userData.phone || "",
          role: "user",
        },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error.message, error);
      
      // If user is already registered, try to login instead
      if (error.message.includes("User already registered")) {
        console.log("⚠️ User already registered, attempting auto-login...");
        const loginResult = await loginUser(userData.email, userData.password);
        if (loginResult.success && loginResult.session) {
          return { 
            success: true, 
            message: "Welcome back! You are now logged in.", 
            session: loginResult.session
          };
        } else {
          // Login failed, return helpful message
          return { 
            success: false, 
            message: "This email is already registered. Please sign in with your password." 
          };
        }
      }
      
      return { success: false, message: "Auth signup failed: " + error.message };
    }

    if (!data.user) {
      console.error("❌ No user returned from signup");
      return { success: false, message: "Failed to create account - no user returned" };
    }

    console.log("✅ Auth user created:", data.user.id);
    console.log("Auth user email confirmed:", data.user.email_confirmed_at);

    // Generate a unique username if empty
    let finalUsername = userData.username;
    if (!finalUsername || finalUsername.trim() === "") {
      // Generate from email: take part before @ and add random suffix
      const emailPrefix = userData.email.split("@")[0];
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      finalUsername = `${emailPrefix}_${randomSuffix}`;
      console.log("⚠️ Username was empty, generated unique username:", finalUsername);
    }

    // Wait for the trigger to create the profile
    console.log("⏳ Waiting for database trigger...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if profile was created by trigger
    let profile = await getProfileById(data.user.id);
    
    if (profile) {
      console.log("✅ Profile created by trigger");
    } else {
      console.log("⚠️ Profile not created by trigger, attempting manual insert...");
      console.log("Manual insert data:", {
        id: data.user.id,
        username: finalUsername,
        email: userData.email,
        full_name: userData.name,
        phone: userData.phone || "",
        role: "user",
      });

      const { data: insertData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          username: finalUsername,
          email: userData.email,
          full_name: userData.name,
          phone: userData.phone || "",
          role: "user",
        })
        .select();

      if (profileError) {
        console.error("❌ Profile insert error:", profileError.code, profileError.message, profileError);
        
        // Check what the actual error is
        if (profileError.code === '23505') {
          // Unique constraint violation
          if (profileError.message.includes('username')) {
            return { success: false, message: "Username already taken" };
          }
          if (profileError.message.includes('email')) {
            return { success: false, message: "Email already in use" };
          }
        }
        
        if (profileError.code === '42P01') {
          return { success: false, message: "Database table error - profiles table missing" };
        }

        // RLS error - this means the policy is blocking insert
        if (profileError.code === '42501' || profileError.message.includes('RLS') || profileError.message.includes('row-level security')) {
          console.error("❌ RLS policy is blocking profile insertion!");
          console.error("The INSERT RLS policy on profiles table is preventing new profiles from being created.");
          console.error("Fix: Run the complete RLS fix SQL in Supabase.");
          return { success: false, message: "Database permission error. Please contact administrator to fix RLS policies." };
        }

        // If insert fails, try to verify profile was created anyway
        console.warn("⚠️ Insert returned error, checking if profile exists...");
        await new Promise(resolve => setTimeout(resolve, 500));
        profile = await getProfileById(data.user.id);
        
        if (!profile) {
          console.error("❌ Profile was NOT created despite signup success. Returning error.");
          return { success: false, message: "Database error: " + profileError.message };
        }
      }

      if (insertData && insertData.length > 0) {
        console.log("✅ Profile created manually:", insertData[0]);
        profile = insertData[0];
      } else if (!profile) {
        // Profile still not found, try one more fetch
        profile = await getProfileById(data.user.id);
      }
    }

    // Verify we have a profile
    if (!profile) {
      console.error("❌ Profile is null after creation attempts");
      profile = await getProfileById(data.user.id);
      if (!profile) {
        return { success: false, message: "Failed to verify profile creation - profile still not found" };
      }
    }

    console.log("✅ Profile verified:", profile);

    const user: User = {
      id: data.user.id,
      username: profile.username || userData.username,
      email: profile.email || userData.email,
      password: "",
      role: profile.role || "user",
      name: profile.full_name || userData.name,
      phone: profile.phone || userData.phone,
      createdAt: new Date(data.user.created_at),
    };

    // Create session from auth user and profile
    // When email confirmations are disabled, data.session might be null
    // So we need to manually create a session
    let session: AuthSession | undefined;
    
    if (data.session && profile) {
      // Session exists (email confirmations enabled)
      session = createSession(data.user, profile, data.session.expires_at);
      saveSessionToStorage(session);
      console.log("✅ Session created from signup response");
    } else if (profile) {
      // No session from signup, but we have auth user and profile
      // Try to get session from Supabase Auth
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (authSession) {
        session = createSession(data.user, profile, authSession.expires_at);
        saveSessionToStorage(session);
        console.log("✅ Session created from auth.getSession()");
      } else {
        // Last resort: manually signin with the credentials
        console.log("⚠️ No session found, attempting manual signin...");
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password,
        });
        
        if (signinError) {
          console.error("❌ Manual signin failed:", signinError.message);
          return { success: false, message: "Registration succeeded but auto-login failed. Please sign in manually." };
        }
        
        if (signinData.session && profile) {
          session = createSession(signinData.user, profile, signinData.session.expires_at);
          saveSessionToStorage(session);
          console.log("✅ Session created from manual signin");
        }
      }
    }

    if (!session) {
      console.warn("⚠️ Warning: No session was created after registration");
      return { 
        success: true, 
        message: "Account created successfully. Please sign in.", 
        user
        // No session returned
      };
    }

    console.log("=== REGISTRATION COMPLETE ===");
    return { 
      success: true, 
      message: "Account created successfully. You are now logged in.", 
      user,
      session 
    };
  } catch (error: any) {
    console.error("❌ Catch block error:", error);
    return { success: false, message: "Registration error: " + (error.message || "Unknown error") };
  }
}

function saveSessionToStorage(session: AuthSession): void {
  try {
    localStorage.setItem("auth_session", JSON.stringify({
      ...session,
      savedAt: Date.now(),
    }));
  } catch (err) {
    console.warn("Could not save session to localStorage:", err);
  }
}

function getSessionFromStorage(): AuthSession | null {
  try {
    const stored = localStorage.getItem("auth_session");
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    // Check if session has expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem("auth_session");
      return null;
    }
    
    return session;
  } catch (err) {
    console.warn("Could not read session from localStorage:", err);
    return null;
  }
}

function clearSessionFromStorage(): void {
  try {
    localStorage.removeItem("auth_session");
  } catch (err) {
    console.warn("Could not clear session from localStorage:", err);
  }
}

export async function loginUser(emailOrUsername: string, password: string): Promise<{ success: boolean; message: string; session?: AuthSession }> {
  try {
    console.log('=== LOGIN START ===');
    console.log('Attempting login with:', { email: emailOrUsername });

    // First, try to login via Supabase Auth directly
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });

    console.log('Supabase auth response:', { hasUser: !!authData?.user, hasSession: !!authData?.session, hasError: !!authError });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      
      // Check if user exists by searching for username
      if (authError.message.includes('Invalid login credentials')) {
        console.log('⚠️ Trying username lookup...');
        const { data: userByUsername } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", emailOrUsername)
          .single();

        if (userByUsername) {
          console.log('✅ Username found, retrying with email:', userByUsername.email);
          // Retry with email
          const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
            email: userByUsername.email,
            password,
          });

          console.log('Retry response:', { hasUser: !!authData2?.user, hasSession: !!authData2?.session, hasError: !!authError2 });

          if (authError2 || !authData2?.user || !authData2?.session) {
            console.error('❌ Retry failed:', authError2?.message);
            return { success: false, message: authError2?.message || "Invalid email or password" };
          }

          console.log('✅ Auth successful, getting profile...');
          const profile = await getProfileById(authData2.user.id);
          if (!profile) {
            console.error('❌ Profile not found for user:', authData2.user.id);
            return { success: false, message: "Profile not found. Please contact support." };
          }

          console.log('✅ Profile found, creating session...');
          const session = createSession(authData2.user, profile, authData2.session.expires_at);
          saveSessionToStorage(session);
          console.log('=== LOGIN COMPLETE ===');
          return {
            success: true,
            message: "Login successful",
            session,
          };
        }
      }

      console.error('❌ Login failed with error:', authError.message);
      return { success: false, message: authError.message || "Invalid email or password" };
    }

    if (!authData?.user || !authData?.session) {
      console.error('❌ No user or session in auth response');
      return { success: false, message: "Authentication failed. Please try again." };
    }

    console.log('✅ Auth successful, getting profile...');
    // Login successful, get profile
    const profile = await getProfileById(authData.user.id);
    if (!profile) {
      console.error('❌ Profile not found for user:', authData.user.id);
      return { success: false, message: "Profile not found. Please register first." };
    }

    console.log('✅ Profile found, creating session...');
    const session = createSession(authData.user, profile, authData.session.expires_at);
    saveSessionToStorage(session);
    console.log('=== LOGIN COMPLETE ===');
    
    return {
      success: true,
      message: "Login successful",
      session,
    };
  } catch (error: any) {
    console.error("❌ Exception during login:", error);
    return { success: false, message: error.message || "Login failed. Please check your credentials." };
  }
}

async function getProfileById(userId: string): Promise<any> {
  try {
    console.log("Getting profile for user:", userId);
    
    // First try: Use filter syntax instead of eq
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .filter("id", "eq", userId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error getting profile:", error.code, error.message);
      
      if (error.code === '42501' || error.message.includes('RLS')) {
        console.warn("⚠️ RLS policy error, profile may not be accessible to this user");
      }
      
      return null;
    }

    if (!data) {
      console.warn("⚠️ Profile not found (no rows returned)");
      return null;
    }

    console.log("✅ Profile retrieved:", data);
    return data;
  } catch (error) {
    console.error("❌ Exception getting profile:", error);
    return null;
  }
}

function createSession(user: any, profile: any, expiresAt: string): AuthSession {
  return {
    userId: user.id,
    username: profile.username,
    role: profile.role,
    name: profile.full_name,
    isLoggedIn: true,
    expiresAt: new Date(expiresAt).getTime(),
  };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const authSession = {
          userId: session.user.id,
          username: profile.username,
          role: profile.role,
          name: profile.full_name,
          isLoggedIn: true,
          expiresAt: new Date(session.expires_at).getTime(),
        };
        saveSessionToStorage(authSession);
        return authSession;
      }
    }

    // If no active session, check localStorage
    const storedSession = getSessionFromStorage();
    if (storedSession) {
      return storedSession;
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    // Try localStorage as fallback
    const storedSession = getSessionFromStorage();
    return storedSession || null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.role === "admin";
}

export async function isUser(): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.role === "user";
}

export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut();
    clearSessionFromStorage();
  } catch (error) {
    console.error("Error logging out:", error);
    clearSessionFromStorage();
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data.map((profile: any) => ({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      password: "",
      role: profile.role,
      name: profile.full_name,
      phone: profile.phone,
      createdAt: new Date(profile.created_at),
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: "",
      role: data.role,
      name: data.full_name,
      phone: data.phone,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
  try {
    const profileUpdates: any = {};
    if (updates.name) profileUpdates.full_name = updates.name;
    if (updates.phone) profileUpdates.phone = updates.phone;
    if (updates.email) profileUpdates.email = updates.email;

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message || "Update failed" };
  }
}

export async function makeUserAdmin(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "User promoted to admin" };
  } catch (error: any) {
    console.error("Error promoting user:", error);
    return { success: false, message: error.message || "Promotion failed" };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "User deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, message: error.message || "Deletion failed" };
  }
}

// Helper to check which mode we're using
export function getAuthMode(): "supabase" {
  return "supabase";
}
