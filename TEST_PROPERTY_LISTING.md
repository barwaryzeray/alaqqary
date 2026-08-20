# How to Test the Property Listing & Notification System

## Prerequisites

1. **Supabase Database Setup**
   - Run the schema from `supabase/schema.sql` in your Supabase dashboard
   - Verify tables: `profiles`, `properties`, `notifications`

2. **Environment Variables**
   - `.env.local` should have:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Create Admin Account**
   - Sign up with an account
   - Go to Supabase dashboard → `profiles` table
   - Change that user's `role` to `admin`

---

## Test Scenario 1: Submit Property & Get Notification

### Step 1: Sign Up as Regular User
1. Open the app: `http://localhost:3000`
2. Click "Sign In" → "Register"
3. Fill in:
   - Username: `testuser1`
   - Email: `testuser1@example.com`
   - Password: `Password123!`
   - Full Name: `John Smith`
   - Phone: `+964 750 123 4567`
4. Click "Register"
5. You should be logged in

### Step 2: Submit a Property
1. Click "Add Property" button (or the "+" icon)
2. **Step 1 - Upload Photos:**
   - Click the upload area
   - Select at least one image
   - Click "Next →"

3. **Step 2 - Fill Property Details:**
   - Title: `Beautiful Apartment in Duhok Center`
   - Price: `180000`
   - Property Type: `Apartment`
   - Area: `120`
   - Bedrooms: `3`
   - Bathrooms: `2`
   - District: `Duhok Center`
   - Address: `Main Street`
   - Description: `Newly renovated 3-bedroom apartment with modern amenities`
   - Your Name: `John Smith` (should be pre-filled)
   - Phone: `+964 750 123 4567` (should be pre-filled)
   - WhatsApp: `+964 750 123 4567` (should be pre-filled)
   - Email: `testuser1@example.com` (should be pre-filled)
   - Click "Next →"

4. **Step 3 - Select Location:**
   - Click on the map to place a pin
   - You should see: "Location set — 36.... , 42...."
   - Click "Publish Listing"

5. **Result:** You should see:
   - ✅ "Listing Submitted!" message
   - Modal closes after 2.5 seconds
   - Property is now in database with status=`pending`

### Step 3: Sign In as Admin
1. Click "Sign Out"
2. Click "Sign In" → "Sign In" (login)
3. Enter admin account credentials
   - Email: (the admin account email)
   - Password: (admin password)
4. Click "Sign In"

### Step 4: Check Admin Dashboard
1. Click "Admin Dashboard" button (should appear now that you're admin)
2. You should see:
   - Tab: "Pending (1)" - shows 1 pending property
   - Tab: "Notifications" with a red badge showing "1"

### Step 5: View Notification
1. Click on "Notifications" tab
2. You should see a notification that says:
   - 📬 Icon
   - "New property submitted"
   - **"John Smith added "Beautiful Apartment in Duhok Center""** ✅
   - Timestamp shown

3. This means the fix is working! (Before the fix, it would show empty seller name and title)

### Step 6: Approve Property
1. Click the notification
2. Modal should show the property preview with all details
3. In the "Pending (1)" tab, click "Approve" button
4. You should see:
   - Property status changes to "approved"
   - Notification is marked as read
   - Property count: "Pending (0)" ← updated!

---

## Test Scenario 2: Verify Notification Data

### Check Console Logs
While performing the above steps, open browser DevTools (F12) and check Console:

**When admin dashboard loads:**
```
[LOAD NOTIFICATIONS] Raw data: [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    property_id: "650e8400-e29b-41d4-a716-446655440001",
    read: false,
    created_at: "2024-08-15T10:30:00Z",
    properties: {
      title: "Beautiful Apartment in Duhok Center",
      submitted_by: "user-uuid-here",
      seller_name: "John Smith"
    }
  }
]
```

**When property is added:**
```
[ADD PROPERTY] Creating property with data: {
  title: "Beautiful Apartment in Duhok Center",
  price: 180000,
  property_type: "Apartment",
  seller_name: "John Smith",
  ...
  images: "1 images"
}
[ADD PROPERTY] Success! Created property: {...}
```

---

## Test Scenario 3: Reject Property

### From Pending Tab:
1. Admin Dashboard → "Pending" tab
2. Click "Reject" button on a property
3. Enter rejection reason: `Images are unclear, please resubmit`
4. Click "Reject Property"
5. Property status changes to `rejected`
6. Property disappears from "Pending" tab
7. Shows up in "All" tab with status="rejected"

---

## Test Scenario 4: Multiple Properties

### Submit Multiple Properties:
1. Sign in as different users
2. Each submits a property
3. Admin Dashboard should show:
   - Pending count increases
   - Notification badge increases
   - Each notification shows correct seller and property names

Example:
```
Pending (3)
Notifications [3]

Notifications shown:
- Sarah Johnson added "Modern Villa in Azadi Park"
- Ahmed Hassan added "Commercial Space Downtown"
- Fatima Ali added "Land Plot in Erbil"
```

---

## Troubleshooting

### No Notifications Appear
**Check:**
1. Is user signed in as admin?
2. Does admin's profile have `role='admin'`?
3. Check browser Console → any error messages?
4. Check Supabase → `notifications` table, any records?
5. Run query in Supabase:
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```

### Seller Name Shows Empty
**Check:**
1. Before fix: This was the original issue (should be fixed now)
2. After fix: If still empty:
   - Check `properties.seller_name` has a value in database
   - Check notification join is working (look at console logs)

### Property Title Shows Empty
**Check:**
1. Check `properties.title` has a value
2. Verify the property_id in notification matches properties.id

### Database Trigger Not Firing
**Check Supabase SQL:**
```sql
-- Verify trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'properties';

-- Verify function exists
SELECT * FROM pg_proc WHERE proname = 'notify_new_property';
```

---

## Expected Database State

After completing Test Scenario 1:

### `profiles` table:
```
id | username  | email              | role
---|-----------|-------------------|------
1  | testuser1 | testuser1@...      | user
2  | admin     | admin@example.com  | admin
```

### `properties` table:
```
id | title                        | status   | submitted_by | seller_name
---|------------------------------|----------|--------------|----------
1  | Beautiful Apartment in...    | approved | 1            | John Smith
```

### `notifications` table:
```
id | type         | message                      | property_id | read | created_at
---|--------------|------------------------------|-------------|------|----------
1  | new_listing  | New property listing: ...    | 1           | true | 2024-08-15...
```

---

## Success Criteria ✅

The feature is working correctly when:

1. ✅ User can submit property with all required fields
2. ✅ "Listing Submitted!" confirmation appears
3. ✅ Admin receives notification with seller name visible
4. ✅ Admin receives notification with property title visible
5. ✅ Admin can click notification to view property
6. ✅ Admin can approve property (status changes to "approved")
7. ✅ Admin can reject property (status changes to "rejected")
8. ✅ Approved property appears on public map
9. ✅ Pending property counter updates correctly
10. ✅ Notification badge shows unread count

If all 10 items are ✅, the property listing system is **fully functional!**

---

## Code Flow Recap

```
User Form
    ↓
handlePublish()
    ↓
addProperty(property)
    ↓
Supabase INSERT into properties (status='pending')
    ↓
Database Trigger: notify_new_property()
    ↓
INSERT into notifications
    ↓
Admin opens dashboard
    ↓
loadNotifications() with JOIN
    ↓
Query returns: [
  {
    propertyTitle: "...",
    sellerName: "...",
    sellerId: "...",
    ...
  }
]
    ↓
Display in Notifications tab ✅
```

