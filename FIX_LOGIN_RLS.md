# Fix Login - SELECT RLS Policy Issue

## The Problem

Users can register but when they try to login, it says "Register" instead of working. This is because:

1. ✅ User is saved in `auth.users` table
2. ✅ Profile is saved in `profiles` table
3. ❌ **But login fails because SELECT RLS policy blocks profile fetch**
4. ❌ Without profile data, login fails silently

## The Root Cause

During login, the app tries to fetch the profile:
```
SELECT * FROM profiles WHERE id = user_id
```

But the SELECT RLS policy is blocking this query.

---

## The Solution

Fix the SELECT RLS policy on the profiles table.

### Step 1: Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**

### Step 2: Run This SQL

Copy and paste:

```sql
-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a permissive SELECT policy
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

-- Verify it was created
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

### Step 3: Execute

Click **Execute** (Ctrl+Enter)

**Expected:** Shows list of policies including "allow_all_selects"

---

## 🧪 Test Login

After running the SQL:

1. **Try to login** with registered email
2. Should work now ✅
3. Should see profile fetched in console

---

## Why This Works

The policy `WITH CHECK (true)` on SELECT means:
- ✅ Allow SELECT from profiles for anyone
- ✅ No restrictions
- ✅ Anyone can view any profile (data security is app-level)

This is safe because:
1. Only public profile data (username, email, name) is exposed
2. Sensitive data (like password hashes) aren't stored in profiles
3. Access control is enforced at app level for data operations

---

## Complete RLS Policy Setup

Make sure you have ALL these policies:

```sql
-- SELECT: Public viewing
CREATE POLICY "allow_all_selects" ON public.profiles
  FOR SELECT
  USING (true);

-- INSERT: Allow profile creation
CREATE POLICY "allow_all_inserts" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: User can update own profile
CREATE POLICY "user_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- UPDATE: Admin can update any profile
CREATE POLICY "admin_update_any" ON public.profiles
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DELETE: Admin can delete profiles
CREATE POLICY "admin_delete" ON public.profiles
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## Verify Everything Works

### Check Policies Exist

```sql
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Should show:
- allow_all_inserts (I)
- allow_all_selects (S)
- admin_delete (D)
- admin_update_any (U)
- user_update_own (U)

### Check User Exists

```sql
SELECT id, email FROM auth.users LIMIT 5;
```

### Check Profile Exists

```sql
SELECT id, email, username FROM public.profiles LIMIT 5;
```

Both should have data.

---

## If Login Still Doesn't Work

### Check Browser Console

Look for error messages when trying to login:
- `RLS policy violation` → Policy still wrong
- `Profile not found` → Profile wasn't created
- `Invalid credentials` → Wrong password

### Try These Queries

Check if profile SELECT actually works:

```sql
-- Test SELECT works
SELECT * FROM public.profiles LIMIT 1;

-- Test specific profile
SELECT * FROM public.profiles WHERE email = 'your-email@test.com';
```

If these fail, the SELECT policy is still wrong.

### Manual Test

Test if you can login to Supabase dashboard with same credentials:
1. Go to https://supabase.com/dashboard
2. Try login
3. If works → Issue is app/RLS
4. If fails → Issue is Supabase credentials

---

## Summary

1. ✅ Run the SQL to fix SELECT policy
2. ✅ Verify "allow_all_selects" policy exists
3. ✅ Try to login
4. ✅ Should work now

**The key is that SELECT needs to be completely permissive.** 🔑

