# Debug Login Issue

Users are registered and profiles exist, but login fails with "Profile not found."

## Step 1: Get Detailed Login Logs

1. **Open your app in browser**
2. **Press F12** to open Developer Tools
3. Go to **Console** tab
4. **Try to login** with a registered email and password
5. **Look for messages starting with `=== LOGIN START ===`**

You should see detailed logs like:

```
=== LOGIN START ===
Attempting login with: {email: "user@example.com"}
Supabase auth response: {hasUser: true, hasSession: true, hasError: false}
✅ Auth successful, getting profile...
❌ Error getting profile: 42501 RLS policy violation
=== LOGIN END ===
```

**Copy and share these logs** - they show exactly what's failing.

---

## Step 2: Check What Error You See

Look for one of these errors in the console:

### Error 1: Auth fails
```
❌ Auth error: Invalid email or password
```
**This means:** Email/password is wrong
**Fix:** Try a different password, or register a new account

### Error 2: Profile not found
```
❌ Error getting profile: [error code] [error message]
✅ Auth successful, getting profile...
❌ Profile not found
```
**This means:** Auth succeeded but can't fetch profile (RLS policy issue)
**Next step:** Check RLS policies

### Error 3: RLS policy violation
```
❌ Error getting profile: 42501 RLS policy violation
```
**This means:** SELECT RLS policy on profiles table is blocking the query
**Fix:** See next section

---

## Step 3: Check RLS SELECT Policy

If you see an RLS error, run this in Supabase SQL Editor:

```sql
SELECT policyname, qual FROM pg_policies 
WHERE tablename = 'profiles' AND polcmd = 'SELECT'
ORDER BY policyname;
```

You should see policies like:
- "Public profiles are viewable by everyone"

The policy should have `USING (true)` to allow all selects.

---

## Step 4: Verify Profile Exists

Run this in SQL Editor (use a real email from your test):

```sql
SELECT id, username, email, full_name, role 
FROM public.profiles 
WHERE email = 'user@example.com';
```

**Expected:** Returns one row with the user's profile data

**If empty:** Profile wasn't created for that user

---

## Step 5: Verify Auth User Exists

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

**Expected:** Returns one row with the auth user

**If empty:** Auth user doesn't exist

---

## Common Issues and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Auth succeeds, profile fetch fails with RLS error | SELECT policy blocks query | Check profiles SELECT RLS policy |
| Profile not found but exists in DB | Profile table query fails silently | Check console for error codes |
| Invalid email or password error | Wrong credentials | Verify email/password are correct |
| No error but stays on login screen | Session not created | Check localStorage for session |

---

## What to Share with Support

When providing logs, include:

1. **Console logs** (F12 → Console)
   - Start with `=== LOGIN START ===`
   - End with `=== LOGIN COMPLETE ===` or error
   - Include ALL the logs in between

2. **The error message** displayed to user

3. **Email address** you're trying to login with

4. **Verification results** from above SQL queries

---

## Manual Fix: Check SELECT Policy

If the issue is RLS SELECT policy, run this in SQL Editor:

```sql
-- Verify SELECT policy allows all users to view profiles
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND polcmd = 'SELECT';
```

If "Public profiles are viewable by everyone" doesn't exist or has wrong conditions, recreate it:

```sql
-- Drop old SELECT policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new permissive SELECT policy
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);
```

Then try login again.

---

## Next Steps

1. ✅ Open browser console (F12)
2. ✅ Try to login
3. ✅ Look for `=== LOGIN START ===` message
4. ✅ Copy ALL console logs
5. ✅ Share the logs and error message

The console logs will tell us exactly what's going wrong! 🔍

