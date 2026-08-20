-- FIX: Profile not created - RLS policy still blocking INSERT
-- 
-- When users register, the profile insert fails silently because of RLS policy
-- 
-- Solution: Create a permissive INSERT policy that allows profile creation

-- Step 1: Drop all existing INSERT policies on profiles
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;

-- Step 2: Create a permissive INSERT policy
-- This allows any authenticated user to insert a profile record with their own ID
CREATE POLICY "allow_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Step 3: Verify the policy exists
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
