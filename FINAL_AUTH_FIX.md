# Final Auth Fix: RLS Policy Violation

## The Problem

When users try to register, they get:
```
❌ Database error: new row violates row-level security policy for table "profiles"
```

This is an **RLS (Row Level Security) policy issue** - the INSERT policy on the profiles table is blocking the trigger from creating profiles.

---

## The Solution

Replace the INSERT RLS policy on the profiles table with the correct one.

### Step 1: Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**

### Step 2: Drop Old Policies and Create New One

Copy and paste this entire SQL:

```sql
-- Drop the old problematic policies
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;

-- Create the correct INSERT policy
CREATE POLICY "System can insert profiles during auth"
  ON public.profiles FOR INSERT
  WITH CHECK (true)
  AS PERMISSIVE;
```

### Step 3: Execute

Click **Execute** (Ctrl+Enter)

**Expected:** Green checkmark with "Success"

### Step 4: Verify

Run this query to confirm the policy exists:

```sql
SELECT policyname, polcmd, polpermissive 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

You should see these policies on the profiles table:
- ✅ "Public profiles are viewable by everyone" (SELECT)
- ✅ "System can insert profiles during auth" (INSERT) ← This is the new one
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Admins can update any profile" (UPDATE)
- ✅ "Admins can delete profiles" (DELETE)

---

## Test Registration

After running the SQL:

1. **Open your app**
2. **Click Register**
3. **Fill in:**
   - Email: `test@example.com`
   - Password: `Password123`
   - Name: `Test User`
4. **Click Create Account**

**Expected:**
- ✅ No more RLS error
- ✅ Auth user is created
- ✅ Profile is created by trigger
- ✅ User is automatically logged in

---

## Why This Works

### The Key Difference

**Old (Broken):**
```sql
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

**New (Fixed):**
```sql
CREATE POLICY "System can insert profiles during auth"
  ON public.profiles FOR INSERT
  WITH CHECK (true)
  AS PERMISSIVE;
```

### What Changed

The `AS PERMISSIVE` clause explicitly tells Supabase that this is a permissive (allow) policy, not a restrictive (deny) policy. This is important because:

1. **Permissive policies allow rows** that pass the check
2. **Restrictive policies deny rows** that fail the check
3. The default is permissive, but being explicit helps Supabase understand your intent
4. This ensures the trigger can insert profiles without hitting RLS blocks

### How Auth Signup Now Works

```
1. User submits registration form
   ↓
2. supabase.auth.signUp() creates auth user
   ↓
3. Trigger fires: handle_new_user()
   ↓
4. Trigger checks RLS policy: "System can insert profiles during auth"
   ↓
5. Policy says: WITH CHECK (true) → ✅ Allow insert
   ↓
6. Profile is created
   ↓
7. Auth user is returned successfully
   ↓
8. App code creates session
   ↓
9. ✅ User is logged in automatically
```

---

## If Still Not Working

### Check #1: Policy Actually Created?

Run this in SQL Editor:

```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname LIKE '%insert%';
```

Should return one row with "System can insert profiles during auth"

### Check #2: Try Registering Again

After creating the policy, try registering with a:
- **Different email** (previous attempts may have created auth users)
- **Different username** (avoid special characters)

### Check #3: Delete Old Test Users

If you've tried registering before and failed:
1. Go to Supabase **Authentication** → **Users**
2. Delete any test user accounts
3. Try registering fresh

### Check #4: Check Profiles Table

Make sure the table exists:

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
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

---

## Complete Setup Checklist

Before trying again, verify:

- ✅ profiles table exists
- ✅ "System can insert profiles during auth" INSERT policy exists
- ✅ Email confirmations are disabled (Authentication → Settings)
- ✅ trigger handle_new_user exists (Database → Functions)
- ✅ Using correct Supabase URL and anon key in .env.local

---

## Success Indicators

You'll know it's working when:

1. Browser console shows:
   ```
   === REGISTRATION START ===
   ✅ Auth user created: xxx
   ✅ Profile created by trigger
   === REGISTRATION COMPLETE ===
   ```

2. You're automatically logged in after registering

3. Page refresh keeps you logged in

4. You can navigate to admin dashboard (if you create an admin user)

---

## Still Stuck?

Try this one more thing - sometimes Supabase needs the function to have the correct permissions. Run this:

```sql
-- Make sure the function has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Verify the trigger exists
SELECT trigger_name, trigger_schema 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

Then try registering again.

