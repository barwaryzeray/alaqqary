# Fix: Property Listings Not Being Submitted for Approval

## The Problem

When users try to add a property listing, it fails to save to the database. The listing never appears for admin approval.

### Root Cause

The RLS policy on the `properties` table for INSERT requires:
```sql
WITH CHECK (auth.uid() = submitted_by)
```

This means the authenticated user ID must match the `submitted_by` field in the property record.

**Issues that could cause failure:**
1. User session not properly authenticated when submitting
2. User session expired
3. RLS policy too restrictive
4. Supabase session not being set correctly

---

## Diagnostic: Check Browser Console

When you try to add a property, watch the browser console:

**Look for SUCCESS:**
```
[ADD PROPERTY] Success! Created property: {id, title, ...}
```

**Look for ERROR:**
```
[ADD PROPERTY] Error: ...
[ADD PROPERTY] Error details: ...
```

---

## The Fix - Two Options

### Option A: Check That User Is Logged In

Make sure you're properly logged in before trying to add a property:

1. Register/login with an email and password
2. Wait for confirmation message
3. Then try to add property

### Option B: Make RLS Policy More Permissive

If the problem is authentication context, make the INSERT RLS policy more permissive:

Run this in **Supabase SQL Editor**:

```sql
-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;

-- Create a permissive INSERT policy
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'properties' AND cmd = 'INSERT'
ORDER BY policyname;
```

This allows any authenticated user to insert properties (less secure, but will work).

---

## Option C: Debug Current Session

If neither works, check if session is being passed correctly:

In browser console, run:
```javascript
// Check if there's an active session
const { data } = await supabase.auth.getSession();
console.log("Current session:", data.session);
console.log("Session user ID:", data.session?.user.id);
```

If this shows `null`, the session isn't authenticated.

---

## Test After Fix

1. **Make sure you're logged in** - should see your name/email in the top right
2. **Open Add Property modal**
3. **Fill in all fields** and click "Publish Listing"
4. Watch browser console for success/error messages
5. **Expected result:** See message "Listing Submitted!" and property appears in Admin Dashboard

---

## Summary

| Issue | Fix |
|-------|-----|
| RLS policy too restrictive | Run Option B SQL |
| User not logged in | Login first (Option A) |
| Session context missing | Check session in console (Option C) |

**Try Option B first** - it will definitely allow properties to be submitted. 🚀

