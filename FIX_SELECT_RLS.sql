-- FIX: Login fails because profile SELECT is blocked by RLS
-- Error: Profile fetch fails silently during login
--
-- Solution: Ensure SELECT RLS policy is permissive

-- Drop the old SELECT policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a permissive SELECT policy that allows all users to view all profiles
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

-- Verify the policy was created
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
