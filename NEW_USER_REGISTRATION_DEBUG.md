# Debug: Why New Profiles Can't Be Created

## The Symptom
- Old profiles can login ✅
- New profiles get "Profile not found. Please register first." ❌

## Root Cause
The RLS INSERT policy on the `profiles` table is blocking new profile creation.

The registration flow:
1. ✅ Auth user is created in `auth.users`
2. ❌ Profile INSERT is blocked by RLS policy
3. ❌ Registration continues anyway without profile
4. ❌ Login tries to fetch profile → not found → login fails

---

## How to Find the Exact Error

### Step 1: Try to register a NEW user

Look at the **browser console** during registration:

You should see one of these errors:

**Error A: RLS Policy Blocking Insert**
```
❌ Profile insert error: 42501 new row violates row-level security policy for table "profiles"
❌ RLS policy is blocking profile insertion!
```

**Error B: Unique Constraint Violation**
```
❌ Profile insert error: 23505 Username already taken
```

**Error C: Other Database Error**
```
❌ Profile insert error: [code] [message]
```

### Step 2: Look for This Pattern

If you see:
```
⏳ Waiting for database trigger...
❌ Profile insert error: ...
Database permission error. Please contact administrator to fix RLS policies.
```

**This confirms RLS is blocking the insert.**

---

## The Fix

Run this SQL in **Supabase SQL Editor**:

### First: See What Policies Exist

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

If you see INSERT policies with complex USING/WITH CHECK clauses, those are likely blocking.

### Then: Drop Old Policies and Create Simple Ones

```sql
-- Drop all old policies
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_inserts" ON public.profiles;
DROP POLICY IF EXISTS "insert_all" ON public.profiles;

-- Create ONLY this simple policy for INSERT
CREATE POLICY "insert_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Create SELECT policy too (needed for login)
CREATE POLICY "select_profile" ON public.profiles
  FOR SELECT
  USING (true);
```

### Verify

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Should show:
- `insert_profile`: INSERT
- `select_profile`: SELECT

---

## Test

1. Close the app (clear browser cache if needed)
2. Try to **register a NEW email**
3. Watch the console - should see:
   ```
   ✅ Profile created manually: {...}
   ✅ Profile verified: {...}
   ```
4. Should auto-login and work ✅

---

## If Still Getting Error

Post the EXACT error from the browser console:
```
❌ Profile insert error: [CODE] [MESSAGE]
```

This will tell us exactly what RLS policy is blocking the insert.

---

## Summary

**The problem:** RLS policies are too restrictive and blocking INSERT

**The solution:** Drop old policies, create simple permissive ones

**Why old users work:** They were already created before policies became restrictive (or policies don't apply retroactively to existing rows)

**Why new users fail:** The INSERT policy blocks profile creation on registration

