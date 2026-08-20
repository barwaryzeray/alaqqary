# Troubleshoot Registration: "Database error saving new user"

Since the issue persists after trying the RLS policy fix, we need to diagnose what's actually going wrong.

## Quick Diagnostic Steps

### Step 1: Get Detailed Error Logs

1. Open your app in a browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Try to register with a test account
5. **Look for messages starting with `=== REGISTRATION START ===`**

You should see detailed logs like:
```
=== REGISTRATION START ===
Username: testuser
Email: test@example.com
✅ Auth user created: uuid-here
⏳ Waiting for database trigger...
❌ Profile insert error: 42501 RLS policy violation
=== END ===
```

**Copy ALL these logs and keep them for diagnosis** - they tell us exactly what's failing.

---

### Step 2: Check Your Database Setup

Run this in the browser console to check if Supabase is properly configured:

```javascript
// Copy and paste this into browser console and press Enter
import { runDiagnostics } from '@/utils/diagnostics'
await runDiagnostics()
```

This will show:
- ✅ or ❌ if Supabase is connected
- ✅ or ❌ if profiles table exists
- ✅ or ❌ if RLS policies are correct
- Exact error codes if something is wrong

---

### Step 3: Verify Required Setup

Go to Supabase dashboard and check:

**1. Database Tables (Database → Tables)**
- ✅ Do you see a `profiles` table?
  - If NO → You need to run schema.sql first

**2. RLS Policies (Authentication → Policies)**
- ✅ Select "profiles" from the table dropdown
- ✅ Do you see this policy? **"System can insert profiles"**
  - If NO → You need to create the INSERT policy

**3. Triggers (Database → Functions)**
- ✅ Do you see `handle_new_user` function?
  - If NO → The trigger isn't set up yet

---

## Common Issues and Exact Fixes

### Issue 1: "profiles table" does not exist

**Error in console:**
```
❌ profiles table does not exist - run schema.sql
```

**Fix:**
1. Go to Supabase → **SQL Editor**
2. Click **New Query**
3. Open your project file: `supabase/schema.sql`
4. Copy ALL the content
5. Paste into SQL Editor
6. Click **Execute**
7. Wait for green checkmark

---

### Issue 2: RLS policy violation (42501)

**Error in console:**
```
❌ Profile insert error: 42501 RLS policy violation
```

**This means:** The INSERT policy on profiles isn't set up correctly.

**Fix:**
1. Go to Supabase → **SQL Editor**
2. Click **New Query**
3. Paste this:
```sql
-- Check existing policies
SELECT policyname, policycmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```
4. Click **Execute** and note which policies exist

5. Then run this to fix:
```sql
-- Drop any old INSERT policy
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;

-- Create the correct one
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

---

### Issue 3: Unique constraint violation (23505)

**Error in console:**
```
❌ Profile insert error: 23505 duplicate key value violates unique constraint "profiles_username_key"
```

**This means:** The username you're trying to use is already taken.

**Fix:** Try registering with a different username. Use only letters, numbers, and underscores.

**Note:** This is a different error and actually means your database IS working - the username just exists already.

---

### Issue 4: Function/Trigger Missing

**Error in console:**
```
❌ Trigger does not exist
```

**Fix:**
1. Go to Supabase → **SQL Editor**
2. Run this:
```sql
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Advanced Diagnostics

If the above steps don't work, run these queries in Supabase SQL Editor to get more info:

### Check table structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

### Check constraints:
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';
```

### Check all RLS policies on profiles:
```sql
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

### See recent database errors:
```sql
-- Check if there are any database function errors
SELECT * FROM pg_stat_user_functions 
WHERE funcname = 'handle_new_user';
```

---

## The Error Message You're Seeing

The error **"Database error saving new user"** comes from line 62 in `utils/auth.ts` when the profile INSERT fails. Our updated code now shows the EXACT error details in the console.

**Here's how to fix it:**

1. Open browser console (F12)
2. Try to register
3. Look at the console logs
4. Find the exact error code (e.g., 42501, 23505, 42P01)
5. Match it to the table above
6. Run the SQL fix
7. Try registering again

---

## Still Stuck?

If you're still getting errors after all this:

1. **Copy everything from the browser console** starting with `=== REGISTRATION START ===` and ending at the error
2. **Go to Supabase Logs** (Monitoring → Logs) and look for any database errors around the time you tried to register
3. **Check if your Supabase project is on the free tier** - free tier has some limitations
4. **Try with a completely fresh email address** - sometimes email validation is strict

---

## Test It Works

Once everything is set up correctly:

1. Register with email: `testuser@test.com`
2. Password: `Password123`
3. You should be automatically logged in ✅

If you see that message in the browser console:
```
=== REGISTRATION COMPLETE ===
```

Then it worked! 🎉

