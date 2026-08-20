-- FIX: Admin can't see pending listings from other users
-- The SELECT RLS policy needs to allow admins to see ALL listings

-- Step 1: Drop the existing SELECT policy
DROP POLICY IF EXISTS "Approved properties are viewable by everyone" ON public.properties;

-- Step 2: Recreate with the SAME logic (should already work)
-- But first, verify the admin user has role='admin'
SELECT id, email, role FROM public.profiles WHERE role = 'admin';

-- If the above query returns NO ROWS, your admin account doesn't have role='admin'
-- Fix it with this (replace 'your-email@example.com' with your actual admin email):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Step 3: Create the SELECT policy
CREATE POLICY "Approved properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (
    status = 'approved' 
    OR auth.uid() = submitted_by 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 4: Verify the policy was created
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'properties' AND cmd = 'SELECT'
ORDER BY policyname;

-- Step 5: Test query - should return all pending properties if you're an admin
SELECT id, title, status, submitted_by FROM public.properties 
WHERE status = 'pending'
ORDER BY created_at DESC;
