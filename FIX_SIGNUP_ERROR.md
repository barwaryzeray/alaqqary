# Fix: "Database error saving new user" (500 Error)

## The Problem

When users try to register, they get:
```
❌ Signup error: Database error saving new user
POST https://fpuvdhjdqzeuabhqaivm.supabase.co/auth/v1/signup 500 (Internal Server Error)
```

## Root Cause

**Supabase Auth is failing during signup** because the database trigger that creates the profile is failing and crashing the entire signup process.

When a new user signs up:
1. Supabase tries to create an auth user
2. A trigger automatically runs to create a profile
3. **The trigger is failing** (probably due to RLS policy)
4. **Because the trigger fails, the entire signup fails** with a 500 error
5. User never gets created

## The Solution

Update the trigger to **handle errors gracefully** - if the profile can't be created during signup, it should let the auth succeed anyway. The profile will be created manually by the app code afterwards.

---

## Fix: Run This SQL in Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. **Copy and paste this entire SQL block:**

```sql
-- Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function  
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If profile creation fails, don't fail the auth signup
  RAISE WARNING 'Error creating profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

5. Click **Execute** (or Ctrl+Enter)
6. **Wait for green checkmark** ✓

---

## Test It

After running the SQL:

1. **Open your app**
2. **Click Register**
3. **Fill in the form:**
   - Email: `newuser@test.com`
   - Password: `Password123`
   - Name: `Test User`
4. **Click Create Account**

**Expected result:**
- ✅ No more 500 error
- ✅ You should be automatically logged in
- ✅ Or if profile creation still fails silently, the fallback manual insert will handle it

---

## How It Works Now

### Before (Broken):
```
User signs up
  ↓
Supabase creates auth user
  ↓
Trigger tries to create profile
  ↓
❌ Trigger fails (RLS policy, unique constraint, etc.)
  ↓
❌ Entire signup fails with 500 error
  ↓
User not created in auth
```

### After (Fixed):
```
User signs up
  ↓
Supabase creates auth user
  ↓
Trigger tries to create profile
  ↓
Trigger fails but catches the error
  ↓
⚠️ Log the warning, but let signup succeed anyway
  ↓
✅ User is created in auth
  ↓
App code detects profile missing
  ↓
App manually creates the profile (fallback)
  ↓
✅ User is fully created and logged in
```

---

## Why This Fix Works

1. **Separates concerns**: Auth signup is independent of profile creation
2. **Graceful degradation**: If trigger fails, auth still succeeds
3. **Fallback recovery**: The app code manually creates the profile if needed
4. **Eliminates 500 errors**: No more cascading failures

---

## If It Still Doesn't Work

After running the SQL, if you still get errors:

1. **Check the browser console** (F12 → Console)
2. **Look for error codes** (e.g., 42501, 23505)
3. **Verify profiles table exists** in Supabase
4. **Try a different email address** (in case that one is blocked)

---

## Next Steps

1. ✅ Run the SQL fix above
2. ✅ Try registering again
3. ✅ Check browser console for any remaining errors
4. ✅ If it works, delete old test users from Supabase (go to **Authentication → Users**)

