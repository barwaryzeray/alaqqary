-- BACKFILL: Create profiles for all auth users that don't have profiles
-- This will fix login for all users who registered before profiles were created
--
-- Run this to create missing profiles for existing auth users

-- First, check how many auth users are missing profiles
SELECT COUNT(*) as auth_users_without_profiles
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Create profiles for all auth users that don't have profiles
INSERT INTO public.profiles (id, username, email, full_name, phone, role, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 8)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  'user',
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT DO NOTHING;

-- Verify: Check if all auth users now have profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)) as missing_profiles;
