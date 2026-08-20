-- FIX: RLS policy violation when creating new user profile
-- Correct syntax for Supabase PostgreSQL

-- Step 1: Drop old problematic policies
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;

-- Step 2: Create the correct INSERT policy (no AS PERMISSIVE for older PostgreSQL)
CREATE POLICY "Allow system to insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Step 3: Verify it was created
SELECT policyname, polcmd
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
