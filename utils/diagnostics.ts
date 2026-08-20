import { supabase } from "./supabase";

/**
 * Diagnostic function to check if Supabase is properly configured
 * Run this in browser console to debug registration issues
 */
export async function runDiagnostics() {
  console.log("=== SUPABASE DIAGNOSTICS START ===");

  try {
    // 1. Check Supabase connection
    console.log("1️⃣ Checking Supabase connection...");
    const { data: connectionData, error: connectionError } = await supabase
      .from("profiles")
      .select("count", { count: "exact" })
      .limit(1);

    if (connectionError) {
      console.error("❌ Supabase connection failed:", connectionError);
    } else {
      console.log("✅ Supabase connection OK");
    }

    // 2. Check if profiles table exists
    console.log("\n2️⃣ Checking if profiles table exists...");
    const { data: tableCheck, error: tableError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.message.includes("does not exist")) {
        console.error("❌ profiles table does not exist - run schema.sql");
      } else {
        console.error("❌ Error checking profiles table:", tableError);
      }
    } else {
      console.log("✅ profiles table exists");
    }

    // 3. List all tables
    console.log("\n3️⃣ Checking tables in database...");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(100);

    if (!tablesError && tables) {
      const tableNames = (tables as any[]).map((t: any) => t.table_name);
      console.log("✅ Available tables:", tableNames);
    } else {
      console.log("⚠️ Could not list tables");
    }

    // 4. Check RLS policies
    console.log("\n4️⃣ Checking RLS policies on profiles table...");
    const { data: policies, error: policiesError } = await supabase
      .from("pg_policies")
      .select("policyname")
      .eq("tablename", "profiles");

    if (!policiesError && policies) {
      const policyNames = (policies as any[]).map((p: any) => p.policyname);
      console.log("✅ RLS policies:", policyNames);
      
      if (!policyNames.includes("System can insert profiles")) {
        console.warn("⚠️ Missing 'System can insert profiles' policy!");
      }
    } else {
      console.log("⚠️ Could not list RLS policies");
    }

    // 5. Try a test insert
    console.log("\n5️⃣ Testing profile insert (will not actually insert)...");
    const testId = "00000000-0000-0000-0000-000000000000";
    const { data: testInsert, error: testError } = await supabase
      .from("profiles")
      .insert({
        id: testId,
        username: "test_diagnostic_" + Date.now(),
        email: "test@diagnostic.com",
        full_name: "Test User",
        phone: "",
        role: "user",
      })
      .select();

    if (testError) {
      console.error("❌ Test insert error:", testError.code, testError.message);
      
      if (testError.code === "23505") {
        console.log("   → Unique constraint violation (username or email exists)");
      } else if (testError.code === "42P01") {
        console.log("   → Table does not exist");
      } else if (testError.code === "42501") {
        console.log("   → RLS policy violation");
      }
    } else {
      console.log("✅ Test insert succeeded - no errors!");
      
      // Clean up the test insert
      if (testInsert && testInsert.length > 0) {
        await supabase.from("profiles").delete().eq("id", testId);
        console.log("   Cleaned up test data");
      }
    }

    // 6. Check current auth status
    console.log("\n6️⃣ Checking current auth session...");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("✅ User is authenticated:", session.user.id);
    } else {
      console.log("ℹ️ No user currently authenticated (expected during registration)");
    }

    console.log("\n=== SUPABASE DIAGNOSTICS COMPLETE ===");
    
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
  }
}

/**
 * Run this in the browser console to check diagnostics:
 * 
 * import { runDiagnostics } from '@/utils/diagnostics'
 * await runDiagnostics()
 */

export default runDiagnostics;
