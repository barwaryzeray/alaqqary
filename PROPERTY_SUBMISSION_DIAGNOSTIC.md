# Property Submission Diagnostic Guide

## Step 1: Check Console Errors

**This is the most important step - do this first.**

1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. **Log in** to your account
5. Click **"Add New Property"** button
6. Fill in the form completely:
   - Upload at least 1 photo
   - Title, Price, Type, Area, District, Address, Description
   - Click on map to set location
7. Click **"Publish Listing"**
8. **Look at the console** - Copy ANY error messages that appear

### Common Error Messages

**Error A - RLS Still Blocking:**
```
[ADD PROPERTY] Error: {code: "42501", message: "new row violates row-level security policy"}
```
→ RLS policy change didn't work. Try Step 2.

**Error B - User Not Authenticated:**
```
[ADD PROPERTY] Error: Not logged in properly. submittedBy: anonymous
```
→ Your session lost. Log out and back in.

**Error C - Database Connection:**
```
[ADD PROPERTY] Error: ...database error...
```
→ Database issue. Check Supabase status.

**Success Message:**
```
[ADD PROPERTY] Success! Created property: {id: "...", title: "..."}
```
→ Property was created! Check admin dashboard.

---

## Step 2: Verify RLS Policies in Supabase

If you see an RLS error, the policies might not have changed.

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Run this query:

```sql
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'properties' 
ORDER BY cmd, policyname;
```

### Look for INSERT policy:

**Good (Permissive):**
```
policyname: "Authenticated users can insert properties"
cmd: INSERT
with_check: true
```

**Bad (Restrictive):**
```
policyname: "Authenticated users can insert properties"
cmd: INSERT
with_check: (auth.uid() = submitted_by)
```

If you see "Bad", run this to fix:

```sql
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);
```

---

## Step 3: Check if Properties Exist in Database

Even if you don't see them in admin dashboard, they might be in the database.

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Run this query:

```sql
SELECT 
  id, 
  title, 
  status, 
  submitted_by, 
  created_at 
FROM public.properties 
ORDER BY created_at DESC 
LIMIT 10;
```

### Expected output:

If properties exist:
```
id | title | status | submitted_by | created_at
---|-------|--------|--------------|----------
abc123 | My Property | pending | def456 | 2026-08-18 10:30
```

If no properties:
```
(no rows)
```

---

## Step 4: Check Pending Properties Query

The admin dashboard uses this query to show pending properties:

1. In Supabase SQL Editor, run:

```sql
SELECT 
  id, 
  title, 
  status, 
  submitted_by, 
  created_at 
FROM public.properties 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Expected output:

Should show all pending properties that users submitted.

If empty, either:
- No properties have been submitted
- All properties are already approved/rejected
- Status field has wrong value

---

## Step 5: Check Admin User Has Correct Role

The admin dashboard checks if user has `role = 'admin'` in profiles table.

1. In Supabase SQL Editor, run:

```sql
SELECT id, email, username, role 
FROM public.profiles 
WHERE role = 'admin';
```

### Expected output:

Should show your admin user:
```
id | email | username | role
---|-------|----------|-----
abc123 | admin@example.com | admin_user | admin
```

If your admin account doesn't show up, run this to make yourself admin:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role FROM public.profiles WHERE email = 'your-email@example.com';
```

---

## Step 6: Full End-to-End Test

After running all diagnostics:

1. **Make sure you're logged in as a REGULAR USER** (not admin)
2. Click **"Add New Property"**
3. Fill completely and submit
4. **Log out**
5. **Log in as ADMIN** (or make yourself admin if needed)
6. Click **Shield icon** → Admin Dashboard
7. Click **"Pending"** tab
8. Should see your property

---

## Checklist

- [ ] Opened DevTools console (F12)
- [ ] Tried to submit property
- [ ] Copied any error messages
- [ ] Checked RLS policies in Supabase SQL
- [ ] Ran query to check if properties exist in database
- [ ] Checked pending properties query
- [ ] Verified admin user has role='admin'
- [ ] Tried end-to-end test

---

## If Still Not Working

Tell me the answers to these:

1. **What error appears in browser console?** (Copy exact message)
2. **Does the RLS policy show** `with_check: true`? (Yes/No)
3. **Does this query return any rows?**
   ```sql
   SELECT COUNT(*) FROM public.properties;
   ```
4. **Is your user role 'admin' in the profiles table?** (Yes/No)
5. **Did you see "Listing Submitted!" message?** (Yes/No)

With these answers, I can fix it directly. 🔍

