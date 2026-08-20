# Login RLS Fix - Corrected SQL

## The Issue

Login doesn't work because the SELECT RLS policy on profiles table is blocking profile lookup.

## The Fix

Run this corrected SQL in **Supabase → SQL Editor**:

```sql
-- Drop old SELECT policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_selects" ON public.profiles;

-- Create permissive SELECT policy
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

-- Verify (note: cmd not polcmd)
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Click **Execute** ✓

---

## After the Fix

1. **Try to login** with registered email
2. Should work ✅

---

## Verify All Policies

Check all required RLS policies are in place:

```sql
-- Drop all old policies first
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create all required policies
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "allow_all_inserts" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admin_update_any" ON public.profiles
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_delete" ON public.profiles
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Verify all policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

---

## Test

1. Register a new user → Should work ✅
2. Login with registered email → Should work ✅
3. Refresh page → Should stay logged in ✅

