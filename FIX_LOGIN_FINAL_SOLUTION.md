# Fix Login - Final Solution

## The Real Problem

Users are registered in `auth.users` but **profiles are NOT being created** in the `profiles` table, even though the app thinks they are.

When login tries to fetch the profile, it doesn't exist, so login fails.

---

## The Solution

We need to:
1. **Fix the RLS INSERT policy** to allow profile creation
2. **Backfill missing profiles** for existing users
3. **Test** that login works

---

## Step 1: Fix RLS Policies

Run ALL of this in **Supabase → SQL Editor**:

```sql
-- Drop all problematic policies
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_selects" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_inserts" ON public.profiles;

-- Create ONLY these policies - simple and permissive
CREATE POLICY "select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "insert_all" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "delete_admin" ON public.profiles FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
```

---

## Step 2: Backfill Missing Profiles

Run this to create profiles for all existing auth users:

```sql
-- Check how many are missing
SELECT COUNT(*) as missing_profiles
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Create missing profiles
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

-- Verify: All users should have profiles now
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;
```

After this, both numbers should be the same.

---

## Step 3: Test Login

1. **Try to login** with your registered email
2. Should work now ✅
3. Check browser console - should see:
   ```
   ✅ Profile retrieved: {id, email, username...}
   ```

---

## If Still Not Working

### Check #1: Do profiles actually exist?

```sql
SELECT COUNT(*) FROM public.profiles;
```

Should be > 0.

### Check #2: Can you query profiles?

```sql
SELECT id, email, username FROM public.profiles LIMIT 5;
```

Should return rows.

### Check #3: Verify specific user

```sql
SELECT * FROM public.profiles WHERE email = 'your-registered-email@test.com';
```

Should return one row.

### Check #4: Check auth user exists

```sql
SELECT id, email FROM auth.users WHERE email = 'your-registered-email@test.com';
```

Should return one row.

---

## Complete Verification Query

Run this to see the full picture:

```sql
SELECT 
  'Auth Users' as type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Profiles' as type,
  COUNT(*) as count
FROM public.profiles
UNION ALL
SELECT 
  'Auth users without profiles' as type,
  COUNT(*) as count
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
```

Expected output:
- Auth Users: X
- Profiles: X (same as auth users)
- Auth users without profiles: 0

---

## What This Does

### RLS Policy Fix
- **select_all**: Anyone can view profiles (needed for login to fetch profile)
- **insert_all**: Anyone can create profiles (needed for registration)
- **update_own**: Users can update their own profile (data integrity)
- **delete_admin**: Only admins can delete profiles (safety)

### Backfill
- Creates profile rows for all auth users that don't have them
- Uses email as fallback for username if not provided
- Ensures every auth user has a profile

---

## Why This Works

1. **Simple RLS policies** that actually allow operations
2. **Backfill ensures** every auth user has a profile
3. **Login can now fetch** the profile successfully
4. **Registration creates** new profiles without issues

---

## Summary

1. ✅ Run the RLS policy fix SQL
2. ✅ Run the backfill SQL
3. ✅ Try to login
4. ✅ Should work now!

**The key is making sure EVERY auth user has a profile.** 🔑

