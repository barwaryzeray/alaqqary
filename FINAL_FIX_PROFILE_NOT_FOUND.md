# Final Fix: Profile Not Found - Root Cause Identified

## The Problem (Root Cause)

The trigger `on_auth_user_created` is **silently failing**:

1. ✅ Auth user is created in `auth.users`
2. ❌ Trigger tries to create profile but FAILS SILENTLY
3. ❌ Profile is NOT in database
4. ❌ Login queries for profile → NOT FOUND → Login fails

**The trigger runs, catches the error, and lets signup continue anyway** - leaving orphaned auth users without profiles.

---

## The Solution

**Disable the broken trigger.** The app code already has better fallback logic to create profiles.

### STEP 1: Disable the Trigger

Run this in **Supabase SQL Editor**:

```sql
-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify it's gone
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
```

Should return no rows after the drop.

---

### STEP 2: Backfill Missing Profiles

This creates profiles for all existing auth users that don't have one:

```sql
-- Check how many are missing
SELECT COUNT(*) as missing_profiles
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Create them
INSERT INTO public.profiles (
  id, 
  username, 
  email, 
  full_name, 
  phone, 
  role, 
  created_at, 
  updated_at
)
SELECT 
  u.id,
  split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 8) as username,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  'user',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;
```

Should show same numbers.

---

### STEP 3: Clean Up Duplicate Empty Usernames

If there are still profiles with empty usernames:

```sql
-- Fix empty usernames
UPDATE public.profiles 
SET username = split_part(email, '@', 1) || '_' || substr(id::text, 1, 8)
WHERE username = '' OR username IS NULL;

-- Verify
SELECT COUNT(*) FROM public.profiles WHERE username = '' OR username IS NULL;
```

Should return 0.

---

### STEP 4: Test

1. **Delete test auth users** in Supabase Dashboard → Authentication → Users
2. **Refresh your app** (Ctrl+Shift+R to clear cache)
3. **Try to register with NEW email**
4. Watch browser console - should see:
   ```
   ✅ Auth user created
   ⏳ Waiting for database trigger...
   ⚠️ Profile not created by trigger, attempting manual insert...
   ✅ Profile created manually: {...}
   ✅ Auth successful, getting profile...
   ✅ Profile found, creating session...
   ```
5. **Should auto-login** ✅

---

## Why This Works

### Old Code (Broken)
```
Auth signup
  ↓
Trigger tries to create profile
  ↓
Trigger FAILS SILENTLY (RLS/constraint error)
  ↓
Profile NOT created
  ↓
Login queries profile
  ↓
Profile not found → Login fails ❌
```

### New Code (Fixed)
```
Auth signup
  ↓
No trigger (disabled)
  ↓
App code checks for profile
  ↓
Profile doesn't exist
  ↓
App creates profile MANUALLY (with error handling)
  ↓
Profile created ✅
  ↓
Login queries profile
  ↓
Profile found → Login succeeds ✅
```

---

## Summary

| Step | What to Do | Status |
|------|-----------|--------|
| 1 | Drop trigger in SQL | Run now |
| 2 | Backfill missing profiles | Run now |
| 3 | Clean duplicate usernames | Run now |
| 4 | Test registration | Should work ✅ |

---

## Verification Commands

After running all fixes, verify everything:

```sql
-- 1. Check trigger is gone
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'auth';
-- Should return NO ROWS

-- 2. Check profiles match auth users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles;
-- Both should be same number

-- 3. Check no empty usernames
SELECT COUNT(*) FROM public.profiles WHERE username = '' OR username IS NULL;
-- Should be 0

-- 4. Check RLS policies are permissive
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
-- Should show SELECT with (true), INSERT with (true), etc.
```

---

## If Still Not Working

After running all steps and testing:

**In browser console during registration, look for:**

❌ If you see:
```
❌ Profile insert error: 23505 duplicate key value violates unique constraint
```
→ There are still duplicate empty/invalid usernames. Run Step 3 again.

❌ If you see:
```
❌ Profile insert error: 42501 row-level security policy
```
→ RLS policies are wrong. Check that INSERT policy has `WITH CHECK (true)`.

❌ If you see:
```
⚠️ Profile not found (no rows returned)
```
→ Profile was created but SELECT query can't find it. Check SELECT RLS policy has `USING (true)`.

✅ If you see:
```
✅ Profile created manually
✅ Profile found
```
→ Everything is working! ✅

