-- FIX: Clean up duplicate empty usernames in profiles table
-- This is blocking new registrations because empty usernames violate unique constraint

-- First, check how many profiles have empty usernames
SELECT COUNT(*) as profiles_with_empty_username 
FROM public.profiles 
WHERE username = '' OR username IS NULL;

-- Fix: Remove the unique constraint temporarily and regenerate usernames
-- Option 1: If there are profiles with empty usernames, regenerate them

-- For all profiles with empty usernames, generate unique usernames from email
UPDATE public.profiles 
SET username = split_part(email, '@', 1) || '_' || substr(id::text, 1, 8)
WHERE username = '' OR username IS NULL;

-- Verify all usernames are now filled
SELECT COUNT(*) as still_empty 
FROM public.profiles 
WHERE username = '' OR username IS NULL;

-- Check: Are all usernames unique now?
SELECT username, COUNT(*) as count 
FROM public.profiles 
GROUP BY username 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- If there are still duplicates, this SQL generates unique usernames:
UPDATE public.profiles 
SET username = username || '_' || substr(id::text, 1, 5)
WHERE id IN (
  SELECT id FROM public.profiles p1 
  WHERE (p1.username = '' OR p1.username IS NULL)
  OR EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p1.id != p2.id AND p1.username = p2.username
  )
);

-- Final verify: All profiles should have unique usernames
SELECT id, email, username 
FROM public.profiles 
ORDER BY username;
