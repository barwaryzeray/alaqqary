-- FIX: Login fails because profile SELECT is blocked by RLS
-- Error: Profile fetch fails during login
--
-- Solution: Create a permissive SELECT RLS policy

-- Drop the old SELECT policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_selects" ON public.profiles;

-- Create a permissive SELECT policy
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

-- Verify the policy was created (using correct column name: cmd not polcmd)
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
