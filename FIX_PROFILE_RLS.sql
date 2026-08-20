-- FIX FOR: Users cannot register - "Database error saving new user"
-- 
-- The issue: The INSERT RLS policy on profiles table was blocking profile creation
-- because it checked auth.uid() = id in an anonymous context.
-- 
-- Solution: Replace the INSERT policy to allow system (trigger) to create profiles

-- Step 1: Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;

-- Step 2: Create new permissive INSERT policy for system to create profiles
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Step 3: Verify the policy was created
-- Run this query to confirm - should return the new policy
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'System can insert profiles';
