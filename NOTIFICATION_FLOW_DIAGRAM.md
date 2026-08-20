# Property Listing & Notification System - Flow Diagram

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS PROPERTY                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │   AddPropertyModal.tsx  │
                    │   handlePublish()       │
                    └─────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  addProperty() function │
                    │  propertyStorage.ts     │
                    └─────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │    Supabase INSERT      │
                    │  into: properties       │
                    │  status: 'pending'      │
                    │  submitted_by: userId   │
                    └─────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE TRIGGER (Automatic)                       │
│            notify_new_property() function                       │
│                                                                 │
│  IF NEW.status = 'pending' THEN                                │
│    INSERT INTO notifications                                   │
│      type: 'new_listing'                                       │
│      message: 'New property listing: ' || title                │
│      property_id: NEW.id                                       │
│  END IF                                                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │ Supabase INSERT         │
                    │ into: notifications     │
                    └─────────────────────────┘
                                  │
                    User sees success message
                    and modal closes ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN OPENS ADMIN DASHBOARD                    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  AdminDashboard.tsx     │
                    │  useEffect → refresh()  │
                    └─────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  loadNotifications()    │
                    │  propertyStorage.ts     │
                    └─────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE QUERY (WITH JOIN) ✓                       │
│                                                                 │
│  SELECT                                                        │
│    notifications.id,                                          │
│    notifications.property_id,                                 │
│    notifications.read,                                        │
│    notifications.created_at,                                  │
│    properties.title,          ← ✓ NOW FETCHED               │
│    properties.submitted_by,   ← ✓ NOW FETCHED               │
│    properties.seller_name     ← ✓ NOW FETCHED               │
│  FROM notifications                                           │
│  LEFT JOIN properties ON                                      │
│    notifications.property_id = properties.id                 │
│  ORDER BY created_at DESC                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
            ┌──────────────────────────────────────┐
            │   Map database results to objects    │
            │                                      │
            │  {                                   │
            │    id: "550e8400...",                │
            │    propertyId: "650e8400...",        │
            │    propertyTitle: ✓ POPULATED       │
            │    sellerName: ✓ POPULATED          │
            │    sellerId: ✓ POPULATED            │
            │    timestamp: 2024-08-15T10:30:00Z  │
            │    read: false                       │
            │  }                                   │
            └──────────────────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│         Display in Admin Dashboard Notifications Tab            │
│                                                                 │
│  📬 New property submitted                                     │
│     John Smith added "Beautiful Apartment in Duhok Center" ✅ │
│     2024-08-15 at 10:30                                       │
│     [Read notification]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    Admin can now:
                    ✓ See seller name
                    ✓ See property title
                    ✓ Click to view property
                    ✓ Approve/Reject listing
```

---

## Database Schema Relationships

```
┌──────────────────────┐         ┌──────────────────────┐
│    PROFILES          │         │   PROPERTIES         │
├──────────────────────┤         ├──────────────────────┤
│ id (UUID) ──┐        │         │ id (UUID)            │
│ username    │        │         │ title                │
│ email       │        │         │ description          │
│ full_name   │        │         │ price                │
│ phone       │        │         │ seller_name          │
│ role        │        │         │ seller_phone         │
│ ...         │        │         │ seller_email         │
└──────────────────────┘         │ submitted_by (UUID) ──┐
         ↑                        │ status               │
         │                        │ created_at           │
         │                        │ ...                  │
         │                        └──────────────────────┘
         │                                 ↑
         │                                 │
         └─────────────────────────────────┘
              (submitted_by references id)


┌──────────────────────┐
│   NOTIFICATIONS      │
├──────────────────────┤
│ id (UUID)            │
│ type                 │
│ message              │
│ property_id (UUID) ──┐
│ read                 │
│ created_at           │
└──────────────────────┘
         ↑
         │
         └─── (property_id references properties.id)
              (This is the KEY join point!)
```

---

## Before vs After Comparison

### BEFORE THE FIX ❌

```typescript
loadNotifications():
  Query: SELECT * FROM notifications
  Result: [
    {
      id: "550e8400...",
      property_id: "650e8400...",
      type: "new_listing",
      message: "New property listing: Beautiful Apartment...",
      read: false,
      created_at: "2024-08-15T10:30:00Z"
      // ❌ NO property title
      // ❌ NO seller name
      // ❌ NO seller ID
    }
  ]

  Mapping:
    propertyTitle: n.message  // ❌ Using message field
    sellerName: ""            // ❌ Empty!
    sellerId: ""              // ❌ Empty!

  Display in UI:
    " added """               // ❌ Useless!
```

### AFTER THE FIX ✅

```typescript
loadNotifications():
  Query: SELECT * FROM notifications
         LEFT JOIN properties ON...
  
  Result: [
    {
      id: "550e8400...",
      property_id: "650e8400...",
      read: false,
      created_at: "2024-08-15T10:30:00Z",
      properties: {
        ✅ title: "Beautiful Apartment in Duhok Center",
        ✅ submitted_by: "user-uuid-here",
        ✅ seller_name: "John Smith"
      }
    }
  ]

  Mapping:
    propertyTitle: prop?.title              // ✅ From properties table
    sellerName: prop?.seller_name           // ✅ From properties table
    sellerId: prop?.submitted_by            // ✅ From properties table

  Display in UI:
    "John Smith added 'Beautiful Apartment in Duhok Center'" ✅
```

---

## Component Data Flow

```
┌────────────────────────────────────────────────────────────┐
│              AddPropertyModal Component                    │
│                                                            │
│  State:                                                   │
│    - form: FormData (title, price, location, etc.)       │
│    - images: string[]                                    │
│    - step: 1 | 2 | 3                                    │
│                                                            │
│  handlePublish() →                                        │
│    1. Get current session                               │
│    2. Create Property object with submittedBy: userId   │
│    3. Call addProperty()                                │
│    4. Show success message                              │
│    5. Close modal                                       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│         propertyStorage.ts: addProperty()                 │
│                                                            │
│  1. Map Property to DatabaseProperty                     │
│  2. Insert into Supabase "properties" table              │
│  3. Trigger automatically fires                          │
│     (see: notify_new_property function)                  │
│  4. Return all properties                                │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              AdminDashboard Component                      │
│                                                            │
│  State:                                                   │
│    - notifications: Notification[]  ← FROM loadNotifs   │
│    - pending: Property[]                                 │
│    - tab: "pending" | "all" | "users" | "notifications" │
│                                                            │
│  refresh() → calls:                                       │
│    - loadPendingProperties()                            │
│    - loadAllProperties()                                │
│    - getUsers()                                         │
│    - loadNotifications() ← WITH FIX ✓                   │
└────────────────────────────────────────────────────────────┘
```

---

## Fix Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    THE PROBLEM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Notification table alone doesn't have:                    │
│    - Property title (stored in properties table)           │
│    - Seller name (stored in properties table)              │
│                                                             │
│  Result: Empty fields in admin UI                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐
│                    THE SOLUTION                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Add LEFT JOIN in the loadNotifications() query:           │
│                                                             │
│  FROM notifications                                        │
│  LEFT JOIN properties ON                                   │
│    notifications.property_id = properties.id               │
│                                                             │
│  This pulls in the missing data from properties table      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐
│                    THE RESULT                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin now sees complete notifications:                    │
│    ✓ Seller name                                           │
│    ✓ Property title                                        │
│    ✓ Timestamp                                             │
│    ✓ Read status                                           │
│                                                             │
│  "John Smith added 'Beautiful Apartment in Duhok'" ✓      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
AddPropertyModal.tsx
    ↓
    └─ imports → utils/propertyStorage.ts
                    ├─ addProperty()
                    └─ getCurrentSession()

AdminDashboard.tsx
    ↓
    └─ imports → utils/propertyStorage.ts
                    ├─ loadNotifications() ← FIXED
                    ├─ loadPendingProperties()
                    ├─ approveProperty()
                    ├─ rejectProperty()
                    ├─ deleteProperty()
                    └─ markNotificationRead()
    
    └─ imports → utils/auth.ts
                    └─ getUsers()
                    └─ makeUserAdmin()
```

