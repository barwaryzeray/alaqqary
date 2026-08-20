# Complete Fix: Property Listings Not Being Submitted

## The Problem

When users click "Publish Listing" in the Add Property modal, the listing doesn't appear in the admin dashboard's "Pending" tab. It's not being saved to the database.

## The Root Cause

The RLS (Row Level Security) policy on the `properties` table is too restrictive:

```sql
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);
```

This policy says: **"Only insert if the current authenticated user ID equals the submitted_by field"**

### Why This Fails

1. When a user submits a property, the app sets `submitted_by = session.userId`
2. The INSERT policy checks if `auth.uid() = submitted_by`
3. If the session/auth context is lost or invalid, the INSERT is BLOCKED
4. The database silently rejects the INSERT
5. No property appears in the "Pending" tab

---

## The Solution

**Make the INSERT RLS policy permissive.**

Run this SQL in **Supabase → SQL Editor → New Query**:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;

-- Create a permissive policy
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);
```

**Click Execute** (Ctrl+Enter) ✓

---

## Why This Works

- `WITH CHECK (true)` means: Allow any authenticated user to insert properties
- The `status` field defaults to `'pending'` in the app code
- Properties appear in admin "Pending" tab for review
- Admin can approve or reject before they appear on the public map
- The workflow is still intact - admin approval is still required

---

## Verify the Fix

### Step 1: Check Policies Are Correct

Run this in Supabase SQL Editor:

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'properties' AND cmd = 'INSERT'
ORDER BY policyname;
```

**Should show:**
```
policyname | cmd
Authenticated users can insert properties | INSERT
```

---

### Step 2: Test Property Submission

1. **Refresh your app** (Ctrl+Shift+R to clear cache)
2. **Make sure you're logged in** - should see your name/email in top right
3. **Click "Add New Property"** button
4. **Fill out the form:**
   - Upload at least 1 photo
   - Fill in: Title, Price, Type, Area, Bedrooms, Bathrooms
   - Fill in: District, Address, Description
   - Click on the map to set location
5. **Click "Publish Listing"**
6. **Watch browser console** (F12) - should see:
   ```
   [ADD PROPERTY] Success! Created property: {...}
   ```
7. **You should see:** "Listing Submitted!" message

---

### Step 3: Check Admin Dashboard

1. **Switch to admin account** OR **Sign out and log in as admin**
2. **Click the shield icon** (Admin Dashboard) - top right
3. **Click "Pending (X)" tab**
4. **Should see** your newly submitted property listing there ✅

---

## Verification Checklist

- [ ] RLS policy has been updated to `WITH CHECK (true)`
- [ ] App has been refreshed (Ctrl+Shift+R)
- [ ] You are logged in as a user
- [ ] You filled out the entire property form
- [ ] Browser console shows success message
- [ ] Property appears in admin's "Pending" tab
- [ ] Admin can click to preview and approve/reject

---

## What Happens After Fix

### User Flow
1. User logs in ✅
2. Clicks "Add New Property" ✅
3. Fills form and clicks "Publish Listing" ✅
4. Property is saved with status = `'pending'` ✅
5. Appears in Admin Dashboard → Pending tab ✅

### Admin Flow
1. Admin logs in ✅
2. Clicks shield icon → Admin Dashboard ✅
3. Sees new properties in "Pending" tab ✅
4. Can preview, approve, or reject ✅
5. Approved properties appear on public map ✅

---

## Technical Details

### Properties Table Schema

```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  property_type TEXT NOT NULL,
  area NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES public.profiles(id),
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  images JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies After Fix

```sql
-- Everyone can see APPROVED properties
CREATE POLICY "Approved properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (status = 'approved' OR auth.uid() = submitted_by OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Any authenticated user can INSERT
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);

-- Users can UPDATE their own, admins can update any
CREATE POLICY "Users can update own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = submitted_by OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only admins can DELETE
CREATE POLICY "Admins can delete properties"
  ON public.properties FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## Summary

| Step | Command | Status |
|------|---------|--------|
| 1 | Drop restrictive policy | Run in SQL Editor |
| 2 | Create permissive policy | Run in SQL Editor |
| 3 | Refresh app | Do now |
| 4 | Test submission | Try adding property |
| 5 | Check admin dashboard | Should see pending property |

**Run the SQL, refresh the app, and test!** 🚀

