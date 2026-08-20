# Fix: Profile Not Created - "Profile not found. Please register first"

## The Problem

Users can register and their auth account is created in Supabase, but their profile isn't being created in the profiles table. When they try to login, they get:

```
❌ Profile not found. Please register first.
```

## Root Cause

The RLS (Row Level Security) policy on the profiles table is still blocking the INSERT operation. The profile insert is failing silently during registration.

---

## Solution

### Step 1: Fix the RLS INSERT Policy

Go to **Supabase → SQL Editor → New Query** and run:

```sql
-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;

-- Create a permissive INSERT policy
CREATE POLICY "allow_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (true);
```

Click **Execute** ✓

---

### Step 2: Create Profiles for Existing Users

If you have auth users that don't have profiles yet, create them with this SQL:

```sql
-- Create profiles for any auth users that don't have profiles
INSERT INTO public.profiles (id, username, email, full_name, phone, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  COALESCE(raw_user_meta_data->>'phone', ''),
  'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
```

This creates profiles for all auth users that don't have one yet.

---

### Step 3: Test Registration Again

Now try registering a new account:

1. Click **Register**
2. Fill in email, password, name
3. Click **Create Account**
4. You should be automatically logged in ✅

---

### Step 4: Test Login with Old Account

If you have an account that registered before the fix:

1. Close the app
2. Clear browser cache (or use private/incognito mode)
3. Go to the app
4. Click **Sign In**
5. Use your existing email and password
6. You should now be able to login ✅

---

## Verify the Fix

### Check RLS Policies

Run this query in SQL Editor:

```sql
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

You should see:
- ✅ "allow_insert_own_profile" (INSERT)
- ✅ Other SELECT/UPDATE/DELETE policies

### Check Profiles Exist

Run this query:

```sql
SELECT COUNT(*) as total_auth_users, 
       (SELECT COUNT(*) FROM public.profiles) as total_profiles
FROM auth.users;
```

The two numbers should match (or profiles should be >= auth users).

---

## How It Works

### Before (Broken)
```
User registers
  ↓
Auth user created ✅
  ↓
Try to insert profile ❌ (RLS blocks it)
  ↓
Profile missing (but auth user exists)
  ↓
Login fails: "Profile not found"
```

### After (Fixed)
```
User registers
  ↓
Auth user created ✅
  ↓
Insert profile ✅ (RLS allows it)
  ↓
Profile created ✅
  ↓
Session created ✅
  ↓
User logged in automatically ✅
```

---

## If It Still Doesn't Work

### Check Console for Errors

When registering, check browser console (F12) for:

```
❌ Profile insert error: [error code] [error message]
```

Common error codes:
- `42P01` - profiles table doesn't exist
- `23505` - unique constraint (username/email taken)
- `42501` - RLS policy still blocking

### Verify Profiles Table

Run in SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Should show these columns:
- id (uuid)
- username (text)
- email (text)
- full_name (text)
- phone (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)

### Check Auth User Exists

If you know an email that was registered, run:

```sql
SELECT id, email, created_at FROM auth.users 
WHERE email = 'yourtest@email.com';
```

Should return one row.

### Check if Profile Exists

```sql
SELECT id, username, email FROM public.profiles 
WHERE email = 'yourtest@email.com';
```

- If **empty result:** Profile wasn't created (RLS still blocking)
- If **returns data:** Profile exists (why isn't login working?)

---

## Complete Checklist

- ✅ Run the RLS policy fix SQL
- ✅ Run the "create profiles for existing users" SQL
- ✅ Try registering a new account
- ✅ Should auto-login immediately
- ✅ Try logging in with existing account
- ✅ Should work without "Profile not found" error

---

## Still Not Working?

If profiles still aren't being created:

1. **Check if INSERT is really happening:**
   - In registration code, look at browser console
   - Should show profile insert logs

2. **Try inserting a profile manually:**
   ```sql
   INSERT INTO public.profiles (id, username, email, full_name, phone, role)
   VALUES ('test-uuid-here', 'testuser', 'test@example.com', 'Test', '', 'user');
   ```
   - If this fails with RLS error, the policy isn't working

3. **Check policy is actually created:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   - Look for "allow_insert_own_profile"
   - If missing, policy creation failed

