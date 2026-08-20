# Fix: Admin Can't See Other Users' Pending Listings

## The Problem

- ✅ Admin can see their OWN pending listings
- ❌ Admin can't see OTHER USERS' pending listings
- ❌ The "Pending" tab shows nothing when regular users submit

## The Root Cause

The RLS SELECT policy requires the admin to have `role = 'admin'` in the profiles table. If that's not set correctly, the admin can't see all listings.

```sql
CREATE POLICY "Approved properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (status = 'approved' OR auth.uid() = submitted_by OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

This says: Show if:
1. Status is 'approved' (public map)
2. User is the one who submitted it
3. User has role = 'admin' in profiles table ← **This must be true for admin to see pending**

## The Fix

### Step 1: Make Sure Admin Has Correct Role

Run this in **Supabase SQL Editor**:

```sql
-- Check which users are admins
SELECT id, email, username, role FROM public.profiles WHERE role = 'admin';
```

**Expected:** Should show your admin user with `role = 'admin'`

If it's empty or your admin account doesn't show:

```sql
-- Replace 'your-admin-email@example.com' with your actual admin email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';

-- Verify
SELECT email, role FROM public.profiles WHERE email = 'your-admin-email@example.com';
```

Should show `role = admin` ✓

---

### Step 2: Make SELECT Policy More Permissive (If Still Not Working)

If admin is set as admin but still can't see pending, make the SELECT policy more permissive:

```sql
-- Drop the current SELECT policy
DROP POLICY IF EXISTS "Approved properties are viewable by everyone" ON public.properties;

-- Create a simpler policy: Anyone can see everything, but details depend on status
CREATE POLICY "Select properties based on status and role"
  ON public.properties FOR SELECT
  USING (
    -- Public can see approved
    status = 'approved' 
    -- Users can see their own (any status)
    OR auth.uid() = submitted_by 
    -- Admins can see all
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### Step 3: Verify the Query Works

Test if the admin can now query pending properties:

```sql
-- Run this as the admin user (Supabase automatically uses your session)
SELECT id, title, status, submitted_by FROM public.properties 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

**Expected:** Should show all pending properties from all users, not just the admin's own.

---

### Step 4: Test in App

1. **Switch to admin account** (if not already)
2. **Refresh app** (Ctrl+Shift+R)
3. **Click Shield icon** → Admin Dashboard
4. **Click "Pending" tab**
5. **Should see** all pending listings from all users ✅

---

## Full Diagnostic

If still not working, run this in Supabase SQL Editor:

```sql
-- 1. Check if admin user exists with correct role
SELECT id, email, role FROM public.profiles WHERE role = 'admin';

-- 2. Check how many pending properties exist
SELECT COUNT(*) as pending_count FROM public.properties WHERE status = 'pending';

-- 3. Check the SELECT policy
SELECT policyname, qual FROM pg_policies 
WHERE tablename = 'properties' AND cmd = 'SELECT';

-- 4. Check if this specific property is readable
SELECT id, title, status, submitted_by FROM public.properties 
WHERE status = 'pending' 
LIMIT 1;
```

---

## Summary

| Check | Command | Expected |
|-------|---------|----------|
| Admin has role? | `SELECT role FROM profiles WHERE email='admin@...'` | `admin` |
| Pending count? | `SELECT COUNT(*) FROM properties WHERE status='pending'` | > 0 |
| Can query pending? | `SELECT * FROM properties WHERE status='pending'` | Returns rows |
| RLS policy correct? | Check SELECT policy in pg_policies | Shows admin check |

**After making admin user** → Refresh app → Should work! ✅

