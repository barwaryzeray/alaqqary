# 🧪 Reproduction Test - Verify the Fix Works

## The Problem Was:
When submitting a property, the system would fail silently because property type "Apartment" wasn't being converted to lowercase "apartment" before database storage.

## The Fix Was:
Added `.toLowerCase()` when storing, and type mapping when reading.

---

## Test 1: Basic Property Submission

### Prerequisites
- Supabase database is running
- App is running locally on `http://localhost:3000`
- `.env.local` has valid Supabase credentials

### Steps

1. **Clear all data first** (recommended for clean test)
   - Open browser DevTools (F12)
   - Application tab → Local Storage
   - Clear all
   - Close DevTools

2. **Sign Up**
   - Go to http://localhost:3000
   - Click "Sign In"
   - Click "Register"
   - Fill form:
     - Username: `testuser`
     - Email: `test@example.com`
     - Password: `Test@1234`
     - Full Name: `Test User`
     - Phone: `+964 750 123 4567`
   - Click "Register"
   - You should be logged in

3. **Submit Property**
   - Click "Add Property" button
   - **Step 1: Photos**
     - Click upload box
     - Choose a photo from your computer
     - Click "Next →"
   - **Step 2: Details**
     - Title: `Beautiful Modern Apartment`
     - Price: `175000`
     - Type: Select `Apartment` (capitalized)
     - Area: `120`
     - Bedrooms: `3`
     - Bathrooms: `2`
     - District: `Duhok Center`
     - Address: `Main Street, Building 42`
     - Description: `Newly renovated 3-bedroom apartment with modern amenities in the heart of Duhok.`
     - Your Name: `Test User` (should be prefilled)
     - Phone: `+964 750 123 4567` (should be prefilled)
     - WhatsApp: `+964 750 123 4567`
     - Email: `test@example.com` (should be prefilled)
     - Click "Next →"
   - **Step 3: Location**
     - Click anywhere on the map to select location
     - You should see: "Location set — 36.xxxxx, 42.xxxxx"
     - Click "Publish Listing"
   
4. **Expected Result**
   - ✅ Modal shows "Listing Submitted!" with checkmark
   - ✅ Modal closes after 2-3 seconds
   - ✅ You're back on main page

### Verification in Supabase

1. **Check Properties Table**
   - Go to Supabase dashboard
   - Navigate to: SQL Editor
   - Run query:
     ```sql
     SELECT id, title, property_type, seller_name, status 
     FROM properties 
     ORDER BY created_at DESC 
     LIMIT 1;
     ```
   - Expected result:
     ```
     id              | title                      | property_type | seller_name | status
     ──────────────────────────────────────────────────────────────────────────────
     550e8400-...   | Beautiful Modern Apartment | apartment     | Test User   | pending
                                                   ↑
                                            MUST BE LOWERCASE!
     ```
   - ✅ property_type is `"apartment"` (lowercase)

2. **Check Notifications Table**
   - Run query:
     ```sql
     SELECT id, type, message, property_id, read 
     FROM notifications 
     ORDER BY created_at DESC 
     LIMIT 1;
     ```
   - Expected result:
     ```
     id              | type        | message                        | property_id | read
     ─────────────────────────────────────────────────────────────────────────────
     abc12345-...   | new_listing | New property listing: Beautiful| 550e8400-.. | false
     ```
     - ✅ Notification exists
     - ✅ type is "new_listing"
     - ✅ property_id references the property

### Browser Console Check

Open DevTools (F12) → Console tab

You should see:
```
[ADD PROPERTY] Creating property with data: {
  ...
  property_type: "apartment",  ← ✅ Lowercase
  seller_name: "Test User",
  submitted_by: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  ← ✅ Valid UUID
  ...
}
[ADD PROPERTY] Success! Created property: {...}
```

---

## Test 2: Admin Approval

### Prerequisites
- Test 1 completed successfully
- Property is in database with status="pending"
- Notification exists

### Steps

1. **Create Admin Account**
   - Go to Supabase dashboard
   - Navigate to: Authentication → Users
   - Click "Create new user"
   - Email: `admin@example.com`
   - Password: `Admin@1234`
   - Click "Create user"
   - Go to: profiles table
   - Find the new user row (by email)
   - Edit the row
   - Change `role` from `"user"` to `"admin"`
   - Save

2. **Sign Out & Sign In as Admin**
   - Go back to app
   - Click username → Sign out
   - Click "Sign In"
   - Enter:
     - Email: `admin@example.com`
     - Password: `Admin@1234`
   - Click "Sign In"
   - ✅ Should be logged in as admin

3. **Open Admin Dashboard**
   - Should see new "Admin Dashboard" button
   - Click "Admin Dashboard"
   - Should see tabs: Pending (1) | All | Users | Notifications

4. **Check Pending Tab**
   - You're in the "Pending" tab
   - Should see the property:
     - ✅ Title: "Beautiful Modern Apartment"
     - ✅ Price: $175,000
     - ✅ Type: "Apartment" (displayed capitalized)
     - ✅ District: "Duhok Center"
     - ✅ Seller: "Test User"
     - ✅ Buttons: View | Approve | Reject | Delete

5. **Check Notifications Tab**
   - Click "Notifications" tab
   - Badge shows: 1
   - Should see notification:
     - ✅ "New property submitted"
     - ✅ Message: "Test User added 'Beautiful Modern Apartment'"
     - ✅ Timestamp shown

6. **Click Notification**
   - Click the notification
   - Should show property preview modal
   - Should show all property details

7. **Approve Property**
   - Click "Approve" button
   - Should see success message
   - Property should move to "All" tab
   - Status should show "approved"
   - Notification should be marked read

### Verification: Property on Map

1. **Sign Out**
   - Click Sign Out

2. **Go to Main Page**
   - Go to http://localhost:3000
   - Click on the map (or wait for it to load)
   - Should see the approved property marker on map

3. **Click Property on Map**
   - Should see property preview with:
     - ✅ Title
     - ✅ Price
     - ✅ Images
     - ✅ Seller info

---

## Test 3: Different Property Types

Repeat Test 1 with different property types to ensure all work:

- [ ] Apartment ← Already tested
- [ ] House
- [ ] Villa
- [ ] Land
- [ ] Commercial
- [ ] Office

Each time:
1. Submit property with different type
2. Check database that type is stored in lowercase
3. Verify in admin dashboard (type displays capitalized)
4. Approve and verify on map

---

## Test 4: Multiple Properties

1. Submit 3-4 properties with different types
2. Admin dashboard should show:
   - Pending (4)
   - All (4) - after approving some
3. Multiple notifications should exist
4. All should be approvable/rejectable

---

## Success Criteria

✅ **All of the following must pass:**

1. **Property saves to database**
   - property_type is lowercase
   - submitted_by is valid UUID
   - status is "pending"

2. **Notification is created**
   - Appears in notifications table
   - References correct property_id
   - Has correct message

3. **Admin sees pending property**
   - Shows in "Pending" tab
   - Title and type display correctly
   - Seller information visible

4. **Admin sees notification**
   - Appears in "Notifications" tab
   - Shows seller name
   - Shows property title
   - Badge shows count

5. **Admin can approve**
   - Status changes to "approved"
   - Property moves to "All" tab
   - Notification marked as read

6. **Approved property shows on map**
   - Visible on public map
   - Can click to view details
   - All information correct

7. **No console errors**
   - F12 console is clean
   - No red error messages

---

## Troubleshooting

### If property_type is still uppercase in database
- Problem: `.toLowerCase()` not applied
- Check: Is line 55 in propertyStorage.ts `property_type: property.type.toLowerCase()`?
- Fix: Verify the file was saved with the change

### If notification not created
- Problem: Database trigger might not have fired
- Check: Did property INSERT succeed? (check database for the property)
- Fix: Verify supabase/schema.sql trigger exists and is correct

### If property appears in wrong type in admin
- Problem: Mapping might not be working
- Check: Type should convert "apartment" → "Apartment"
- Fix: Verify lines 18-50 in propertyStorage.ts have typeMap

### If admin can't approve
- Problem: RLS policy might be blocking update
- Check: Do you have admin role? (check profiles table)
- Fix: Manually set role to "admin" in Supabase dashboard

---

## Expected Timeline

- Test 1 (Submit): 2 minutes
- Test 2 (Approve): 3 minutes  
- Test 3 (Types): 5 minutes
- **Total: ~10 minutes to fully verify**

---

## Final Check

If all tests pass ✅✅✅:

```
🎉 PROPERTY LISTING SYSTEM IS WORKING!
```

You can now:
- Deploy to production
- Share with users
- Start listing properties
- No more silent failures!

