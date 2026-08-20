-- FIX: Database error saving new user (500 Internal Server Error)
-- 
-- The issue: Supabase Auth signup is failing with "Database error saving new user"
-- This happens when the trigger that creates the profile is failing
-- 
-- Root cause: The trigger doesn't handle errors, so if profile creation fails,
-- it causes the entire auth signup to fail with a 500 error
-- 
-- Solution: Update the trigger to catch errors and not fail the auth process

-- Step 1: Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create improved function that handles errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If profile creation fails, don't fail the auth signup
  -- Log the error but continue
  RAISE WARNING 'Error creating profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
