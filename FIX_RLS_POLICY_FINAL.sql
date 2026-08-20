-- FIX: RLS policy violation when creating new user profile
-- 
-- Error: "new row violates row-level security policy for table profiles"
-- 
-- Root cause: The RLS policy needs to be PERMISSIVE and allow the trigger/system to insert
-- 
-- Solution: Replace the INSERT policy with the correct one

-- Step 1: Drop the old problematic INSERT policy
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;

-- Step 2: Create the correct INSERT policy that allows system operations
CREATE POLICY "System can insert profiles during auth"
  ON public.profiles FOR INSERT
  WITH CHECK (true)
  AS PERMISSIVE;

-- Verify it was created
SELECT policyname, polcmd, polpermissive 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
