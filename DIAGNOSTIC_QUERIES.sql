-- DIAGNOSTIC: Check the current state of profiles and RLS

-- 1. Check how many auth users exist
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 2. Check how many profiles exist
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 3. Check which auth users DON'T have profiles
SELECT u.id, u.email FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 4. List all current RLS policies on profiles table
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 5. Test: Can we SELECT from profiles as anon user?
SELECT COUNT(*) FROM public.profiles;

-- 6. List all profiles (first 10)
SELECT id, email, username FROM public.profiles LIMIT 10;

-- 7. Check if specific user has a profile (replace with actual email)
SELECT * FROM public.profiles WHERE email = 'test@example.com';

-- 8. Check profiles table schema
\d+ public.profiles;
