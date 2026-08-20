# Debug: Property Listings Not Submitting

## Quick Check - Browser Console

When you try to add a property listing:

1. Open **Browser Console** (F12)
2. Fill out the add property form
3. Click **Publish Listing**
4. Watch for messages

### Look for One of These:

**✅ SUCCESS:**
```
[ADD PROPERTY] Success! Created property: {...}
Listing Submitted!
```
→ Property was created successfully

**❌ ERROR - Most Likely:**
```
[ADD PROPERTY] Error: {message: "...", code: "42501", ...}
[ADD PROPERTY] Error details: {...}
```
→ RLS policy is blocking the INSERT

**❌ ERROR - User Not Logged In:**
```
[ADD PROPERTY] Error: Not logged in properly. submittedBy: anonymous
```
→ Session is not authenticated

---

## The Root Cause

The RLS policy on `properties` table for INSERT:

```sql
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);
```

This requires the authenticated user ID (`auth.uid()`) to match the `submitted_by` field in the property record.

**When this fails:**
1. User not properly logged in → `auth.uid()` might be null
2. Session context lost → Supabase doesn't recognize the user
3. Property has wrong `submitted_by` value → Doesn't match authenticated user

---

## The Fix (Choose One)

### Fix #1: Make RLS Policy Permissive (Recommended - Fastest)

Run this in **Supabase SQL Editor**:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;

-- Create a permissive policy
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'properties' AND cmd = 'INSERT'
ORDER BY policyname;
```

**What this does:** Allows ANY authenticated user to insert properties. Less secure but will definitely work.

---

### Fix #2: Debug Current Session First

If you want to debug before changing policies:

In browser console, paste this:

```javascript
// Check current auth session
const { data } = await supabase.auth.getSession();
console.log("=== CURRENT SESSION ===");
console.log("Session exists:", !!data.session);
console.log("User ID:", data.session?.user.id);
console.log("Email:", data.session?.user.email);
console.log("User metadata:", data.session?.user.user_metadata);

// Check if you're logged into the app
const session = localStorage.getItem("auth_session");
console.log("App session stored:", !!session);
if (session) console.log("App session data:", JSON.parse(session));
```

**Expected output if logged in:**
```
Session exists: true
User ID: ecbe5e06-676e-4ae0-a545-8aa772a0d49a
Email: yourname@example.com
```

**If it shows `null`:** You're not logged in. Log out and back in.

---

### Fix #3: Verify RLS Policies Are Correct

Run this in **Supabase SQL Editor** to see all properties policies:

```sql
SELECT policyname, cmd, qual, with_check FROM pg_policies 
WHERE tablename = 'properties'
ORDER BY cmd, policyname;
```

**Expected output:**
- SELECT: Should allow everyone or status='approved'
- INSERT: Should have `WITH CHECK (true)` or similar permissive rule
- UPDATE/DELETE: Should be admin only

**If INSERT shows `WITH CHECK (auth.uid() = submitted_by)`:** That's the problem. Use Fix #1.

---

## Test After Fix

1. **Make sure you're logged in** - see your name in top right of app
2. **Click "Add New Property"** button
3. **Fill in all required fields:**
   - Upload at least 1 photo
   - Property title, price, area, district, address, description
   - Set location on map
4. **Click "Publish Listing"**
5. **Watch browser console** - should see success message
6. **Go to Admin Dashboard** - should see listing in "Pending" tab

---

## If Still Not Working

### Step 1: Verify Properties Can Be Inserted

Run this in **Supabase SQL Editor**:

```sql
-- Check if we can insert a test property
INSERT INTO public.properties (
  id, title, description, price, property_type, area,
  district, address, latitude, longitude, images,
  status, submitted_by, seller_name, seller_phone
) VALUES (
  gen_random_uuid(),
  'TEST PROPERTY',
  'Test description',
  100000,
  'apartment',
  150,
  'Test District',
  'Test Address',
  36.8625,
  43.1189,
  '[]'::jsonb,
  'pending',
  '00000000-0000-0000-0000-000000000000',
  'Test Seller',
  '+964'
);

-- Check if it was inserted
SELECT COUNT(*) FROM public.properties WHERE title = 'TEST PROPERTY';
```

If you see `1`, the INSERT is working. If error, RLS is still blocking.

### Step 2: Check Pending Properties Query Works

```sql
-- Check if we can query pending properties
SELECT id, title, status, submitted_by FROM public.properties 
WHERE status = 'pending'
LIMIT 10;
```

Should return the test property and any real submissions.

### Step 3: Delete Test Property

```sql
DELETE FROM public.properties WHERE title = 'TEST PROPERTY';
```

---

## Summary

| Issue | Fix |
|-------|-----|
| RLS blocking INSERT | Use Fix #1 SQL |
| User not logged in | Log out and back in |
| Session context lost | Close app, refresh, log in again |
| Policies too strict | Run Fix #1 to make permissive |

**Start with Fix #1 (make RLS permissive)** - it will work. 🚀

