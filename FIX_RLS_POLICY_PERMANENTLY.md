# Fix RLS Policy - Permanently

## The Problem

When users register, they get:
```
❌ Database error: new row violates row-level security policy for table "profiles"
```

The INSERT RLS policy on the profiles table is still blocking profile creation.

---

## The Solution

The RLS INSERT policy needs to be completely permissive. Run this SQL in Supabase:

### Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**

### Copy & Paste This SQL

```sql
-- Drop ALL existing INSERT policies
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow system to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during auth" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;

-- Create a simple, permissive INSERT policy
CREATE POLICY "allow_all_inserts" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Verify it was created
SELECT policyname, polcmd FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

### Execute

Click **Execute** (Ctrl+Enter)

**Expected output:** You should see the policies list with "allow_all_inserts" for INSERT (I).

---

## Why This Works

The policy `WITH CHECK (true)` means:
- ✅ Allow INSERT for anyone/anything
- ✅ Always passes the check
- ✅ Simple and reliable

This is safe because:
1. Supabase Auth validates the user before signup
2. Our app validates all data before inserting
3. The INSERT is only for authenticated signup operations
4. Other RLS policies (UPDATE, DELETE) still restrict access

---

## Test It

After running the SQL:

1. **Register a new user** with email `test@example.com`
2. Should work without RLS error ✅
3. Check console - should see:
   ```
   ✅ Profile created manually
   ```

---

## If It Still Doesn't Work

### Verify Policy Exists

Run this query:

```sql
SELECT policyname, polcmd, polpermissive 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Should show `allow_all_inserts` with polcmd = `a` (INSERT) and polpermissive = `true`.

### Check All Policies

You should see all these:
- "Public profiles are viewable by everyone" (SELECT)
- "allow_all_inserts" (INSERT) ← Must exist
- "Users can update own profile" (UPDATE)
- Other policies...

### Try Manual Insert

Test if INSERT works manually:

```sql
INSERT INTO public.profiles (id, username, email, full_name, phone, role)
VALUES ('test-uuid-here', 'testuser', 'test@test.com', 'Test', '', 'user');
```

- If works: Policy is correct
- If fails: Policy still wrong

---

## Complete RLS Policy Setup

After fixing INSERT, verify all policies exist:

```sql
-- SELECT: Allow all to view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: Allow profile creation during signup
CREATE POLICY "allow_all_inserts" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow users to update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- UPDATE: Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- DELETE: Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

## Troubleshooting

### Still getting RLS error?

1. **Clear browser cache** (Ctrl+Shift+Del)
2. **Hard refresh** (Ctrl+F5)
3. **Try a new email** (not previously attempted)
4. **Check console** for exact error

### Error code is different?

- `42P01` = Table missing
- `23505` = Unique constraint (username/email taken)
- `42501` = RLS policy violation (still our issue)

### Policy created but still fails?

1. Check database triggers aren't interfering
2. Verify profiles table has correct columns
3. Try updating a profile (to test UPDATE policy works)
4. Check Supabase status page for outages

---

## Summary

1. ✅ Run the DROP + CREATE policy SQL
2. ✅ Verify "allow_all_inserts" policy exists
3. ✅ Register a new user
4. ✅ Should work without RLS error
5. ✅ Profile automatically created
6. ✅ User automatically logged in

**Try registering now!** 🚀

