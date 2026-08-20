# Complete RLS and Profile Fix

## What's Actually Happening

1. ✅ Users register → auth user is created in `auth.users`
2. ❌ Profile is NOT created in `profiles` table (INSERT blocked by RLS or INSERT fails silently)
3. ❌ Login tries to fetch profile → can't find it → login fails

---

## Complete Fix (Run ALL in order)

### STEP 1: Run Diagnostics

First, see what's actually in the database:

```sql
-- How many auth users exist?
SELECT COUNT(*) as auth_users FROM auth.users;

-- How many profiles exist?
SELECT COUNT(*) as profiles FROM public.profiles;

-- Which auth users are missing profiles?
SELECT u.id, u.email FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- What RLS policies are currently active?
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Take note of:**
- How many auth users exist (e.g., 5)
- How many profiles exist (e.g., 1)
- The difference is missing profiles

---

### STEP 2: Drop ALL Old RLS Policies

```sql
-- Drop everything that might be blocking
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
DROP POLICY IF EXISTS "select_all" ON public.profiles;
DROP POLICY IF EXISTS "insert_all" ON public.profiles;
DROP POLICY IF EXISTS "update_own" ON public.profiles;
DROP POLICY IF EXISTS "delete_admin" ON public.profiles;
```

---

### STEP 3: Create NEW Permissive RLS Policies

```sql
-- For development: VERY permissive policies
-- In production, you'd want stricter policies

CREATE POLICY "select_profile" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "insert_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_profile" ON public.profiles
  FOR UPDATE
  USING (true);

CREATE POLICY "delete_profile" ON public.profiles
  FOR DELETE
  USING (true);
```

---

### STEP 4: Backfill ALL Missing Profiles

```sql
-- Create profiles for ALL auth users that don't have one
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
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 8)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  'user',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT DO NOTHING;
```

---

### STEP 5: Verify Everything

```sql
-- Check: Do we now have same count of auth users and profiles?
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)) as missing;

-- Check: Can we select from profiles?
SELECT id, email, username FROM public.profiles LIMIT 5;

-- Check: Are policies correct?
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Expected output:
- `auth_users`: 5
- `profiles`: 5
- `missing`: 0
- Policies: 4 policies (select, insert, update, delete)

---

## Now Test the App

1. **Try to login** with registered email → Should work ✅
2. **Try to register** new email → Should work ✅
3. Check browser console → Should see:
   ```
   ✅ Profile retrieved: {...}
   ✅ Auth successful, getting profile...
   ```

---

## If STILL Not Working

### Check 1: Are profiles actually being created on registration?

In browser DevTools Console, during registration you should see:
```
✅ Profile created manually: {...}
```

If you see:
```
❌ Profile insert error: code, message
```

Then the INSERT is still being blocked. Try this SQL:

```sql
-- Temporarily disable RLS entirely (DANGEROUS - dev only!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Now try to register a new user in the app
-- If it works, RLS was the problem

-- If it works, re-enable RLS and check policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Check 2: Verify a specific user's profile

```sql
-- Replace 'test@example.com' with actual registered email
SELECT * FROM public.profiles WHERE email = 'test@example.com';
```

Should return one row.

### Check 3: Check the profiles table structure

```sql
\d+ public.profiles;
```

Should show:
- `id` uuid PRIMARY KEY
- `username` text
- `email` text  
- `full_name` text
- `phone` text
- `role` text
- `created_at` timestamp
- `updated_at` timestamp

---

## Summary

1. ✅ Drop all old RLS policies
2. ✅ Create 4 permissive RLS policies (select, insert, update, delete)
3. ✅ Backfill missing profiles for all auth users
4. ✅ Verify counts match
5. ✅ Test login and registration

**The key insight:** Every auth user MUST have a corresponding profile in the profiles table, or login will fail.

