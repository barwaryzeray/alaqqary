-- QUICKEST FIX: Disable the trigger that's causing RLS violations
-- The app code will create the profile manually anyway
--
-- This is the fastest way to get registration working

-- Simply drop the trigger that's failing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- The profile will be created by the app code (auth.ts) instead
-- This is actually MORE reliable because:
-- 1. The app has full control over what data is saved
-- 2. No RLS issues
-- 3. Better error handling
-- 4. Cleaner separation of concerns
