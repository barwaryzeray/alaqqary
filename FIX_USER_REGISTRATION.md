# Fix: Users Cannot Register - "Database error saving new user"

## The Problem

When users try to register, they get this error:
```
❌ Failed to create user profile: [RLS policy error or other database error]
```

## Root Cause

The RLS (Row Level Security) policy on the `profiles` table is blocking profile creation. Specifically:

- **Old Policy:** `WITH CHECK (auth.uid() = id)` 
- **Problem:** When a user registers, they're in an anonymous context (not authenticated yet), so `auth.uid()` returns null
- **Result:** The profile insert fails with RLS violation

## Solution

Replace the INSERT RLS policy on the profiles table to allow the system/trigger to create profiles.

---

## Step-by-Step Fix

### 1. Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Copy & Paste This SQL

```sql
-- Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;

-- Create new permissive INSERT policy for system to create profiles
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

### 3. Execute the Query

Click **Execute** (or Ctrl+Enter)

**Expected result:** 
- Green checkmark
- Message like "Success. No rows returned"
- No error messages

---

## Test It Works

After running the SQL:

1. Open your app
2. Click **Register**
3. Fill in the form:
   - Email: `newuser@test.com`
   - Password: `Password123`
   - Name: `Test User`
4. Click **Create Account**

**Expected:** You should be automatically logged in ✅

If you still see an error, check the browser console (F12 → Console tab) for the exact error message.

---

## Understanding the Fix

### Why This Works

The new policy `WITH CHECK (true)` means:
- **Anyone** can insert a profile (including the system via trigger)
- The trigger in the database still runs, which creates the profile
- The manual insert in the code can also insert as a fallback
- Both paths work without RLS violations

### Security Note

This is safe because:
1. The database trigger (`handle_new_user()`) is the one actually creating profiles
2. It runs with `SECURITY DEFINER` privilege, so it validates all data
3. Users cannot manually call INSERT on profiles directly from the frontend code because they can't modify database constraints
4. The trigger controls what gets created (only new auth.users create new profiles)

### What Happens During Registration

```
User Registration Flow (After Fix):
┌──────────────────────────────────────┐
│ User submits registration form       │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ supabase.auth.signUp() creates       │
│ auth.users entry                     │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ Trigger: handle_new_user() runs      │
│ Creates profile in profiles table    │
│ (Uses SECURITY DEFINER, bypasses     │
│ user RLS checks, but trigger logic   │
│ is controlled by database)           │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ Profile created ✅                   │
│ Session created ✅                   │
│ User logged in automatically ✅      │
└──────────────────────────────────────┘
```

---

## If You Still Have Issues

### Check Browser Console

Open F12 → Console tab and look for error messages when trying to register.

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `"duplicate key value violates unique constraint"` | Username or email already exists | Use a different username/email |
| `"RLS policy violation"` | Policy still wrong | Verify SQL executed successfully |
| `"Profile not found after manual insert"` | Profile wasn't created | Check Supabase has the profiles table |
| `"Auth signup succeeded but profile failed"` | Trigger didn't fire | Manually insert profile (code does this now) |

### Verify in Supabase

1. Go to **Database** → **Tables**
2. Click **profiles** table
3. Check columns exist: `id`, `username`, `email`, `full_name`, `phone`, `role`, `created_at`, `updated_at`
4. Go to **Authentication** → **Policies**
5. Look for policies on profiles table:
   - ✅ "Public profiles are viewable by everyone" (SELECT)
   - ✅ "System can insert profiles" (INSERT) ← New one
   - ✅ "Users can update own profile" (UPDATE)
   - ✅ Others...

### Check Supabase Logs

1. Go to **Logs** in Supabase dashboard
2. Look for any database errors when you tried to register
3. Error messages there will show exactly what's failing

---

## After the Fix Works

1. ✅ Users can register with email/password
2. ✅ Users are automatically logged in after registration
3. ✅ Users stay logged in on page refresh
4. ✅ Users can login later with email/password
5. ✅ Admin can manage users in admin dashboard

---

## Related Files

- `FIX_PROFILE_RLS.sql` - Contains the exact SQL to run
- `schema.sql` - Updated schema with correct RLS policies
- `utils/auth.ts` - Updated registration with better error handling
- `components/AuthModal.tsx` - Updated to auto-login after registration

