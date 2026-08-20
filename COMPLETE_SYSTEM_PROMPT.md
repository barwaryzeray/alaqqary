# Duhok Real Estate Platform - Complete System Prompt for Recreation

## 🎯 PROJECT OVERVIEW

**Project Name**: Duhok Real Estate - Modern Map-First Property Platform  
**Purpose**: A premium, full-stack real estate web application focused exclusively on Duhok Governorate, Iraq  
**Target Users**: Property buyers, sellers, and real estate agents  
**Region**: Duhok Governorate, Iraq (centered at coordinates: 36.8630°N, 42.9910°E)  
**Status**: Production-ready August 2026  

---

## 🏗️ TECHNOLOGY STACK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS 3.4
- **Maps**: React Leaflet 4.2.1 + Leaflet 1.9.4
- **Clustering**: React Leaflet Cluster 2.1.0
- **Icons**: Lucide React 0.378.0
- **Runtime**: Node.js 18+

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT tokens, secure cookies)
- **Storage**: Supabase Storage (for property images)
- **Query Client**: Supabase JavaScript SDK

### Deployment
- **Primary**: Vercel (auto-deploy from GitHub)
- **Secondary**: Netlify
- **Alternative**: Docker, VPS (DigitalOcean, AWS EC2)

---

## 📊 SUPABASE DATABASE SCHEMA

### Table 1: `profiles` (User profiles, extends Supabase Auth)
```sql
- id UUID PRIMARY KEY (references auth.users)
- username TEXT UNIQUE NOT NULL
- email TEXT NOT NULL
- full_name TEXT NOT NULL
- phone TEXT DEFAULT ''
- role TEXT ('user' | 'admin') DEFAULT 'user'
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()
```

### Table 2: `properties` (Main property listings)
```sql
- id UUID PRIMARY KEY
- title TEXT NOT NULL
- description TEXT NOT NULL
- price NUMERIC NOT NULL
- property_type TEXT ('apartment'|'house'|'villa'|'land'|'commercial'|'office')
- area NUMERIC NOT NULL (in square meters)
- bedrooms INTEGER
- bathrooms INTEGER
- district TEXT NOT NULL (e.g., "Duhok Center", "Zakho", "Amadiya")
- address TEXT NOT NULL (street address)
- latitude NUMERIC NOT NULL (GPS coordinate)
- longitude NUMERIC NOT NULL (GPS coordinate)
- images JSONB (array of image URLs)
- status TEXT ('pending'|'approved'|'rejected') DEFAULT 'pending'
- submitted_by UUID (FK to profiles.id)
- seller_name TEXT NOT NULL
- seller_phone TEXT NOT NULL
- seller_email TEXT
- rejection_reason TEXT (for rejected listings)
- featured BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()
```

### Table 3: `notifications` (Admin alerts for new listings)
```sql
- id UUID PRIMARY KEY
- type TEXT ('new_listing'|'approval'|'rejection')
- message TEXT NOT NULL
- property_id UUID (FK to properties.id)
- read BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT NOW()
```

### Database Features
- **Row Level Security (RLS)**: Enforces access control
  - Profiles: Public read, users update own, admins manage all
  - Properties: Approved visible to all, users see own pending, admins see all
  - Notifications: Admin-only access
- **Triggers**: Auto-create profile on user signup, auto-update timestamp, auto-create notification on property submission
- **Indexes**: On status, submitted_by, created_at, read, username for performance

---

## 🎨 FRONTEND ARCHITECTURE

### App Structure: `app/page.tsx`
- **Layout**: 100% full-screen interactive map (no traditional homepage)
- **UX Philosophy**: Map-first, immersive experience, like Google Maps for real estate
- **Dark Mode**: System-wide theme support

### Core Components

#### 1. **Map.tsx** - Main interactive map
- React Leaflet map centered on Duhok (36.8630, 42.9910)
- Custom property markers with house emoji icons
- Color-coded markers: Blue for featured, standard for regular
- React Leaflet Cluster for automatic marker grouping
- Hover animations, click handlers
- Dark mode map tiles (switches provider)

#### 2. **Navigation.tsx** - Floating top navigation bar
- Logo and brand name
- Location search box (real-time filtering)
- Property type dropdown (All, Apartment, House, Villa, Land, Commercial, Office)
- Price range filter panel (min/max inputs)
- "Add Property" button (prominent CTA)
- Dark mode toggle (sun/moon icon)
- User profile icon (account access)
- Responsive design (hides text on mobile)

#### 3. **PropertyPreviewCard.tsx** - Popup marker preview
- Triggers on marker click
- Featured badge (if featured)
- Large first property image
- Price in bold
- Quick info: District, Type, Area (m²)
- "View Details" button
- Smooth fade-in animation

#### 4. **PropertyDetails.tsx** - Side panel with full information
- Slides in from right (desktop) / full-screen (mobile)
- Image gallery with arrow navigation
- Swipe gestures support
- Full property information organized by sections
- Seller information card (name, phone, WhatsApp, email)
- Embedded map showing exact location
- "Call Seller" and "WhatsApp" buttons
- Close button returns to map
- Responsive: full-screen on mobile, side panel on desktop

#### 5. **AddPropertyModal.tsx** - 3-step property submission wizard

**Step 1: Upload Photos**
- Drag & drop or click-to-upload
- Multiple images support
- Preview grid
- Remove image buttons
- Progress indicator
- "Next" button advances to step 2

**Step 2: Property Details Form**
- Title, Price, Property Type, Area (m²)
- Optional: Bedrooms, Bathrooms
- District dropdown (predefined Duhok districts)
- Address text input
- Description textarea
- Seller name, phone, email
- Form validation
- "Previous" / "Next" navigation

**Step 3: Map Location Selection**
- Interactive Leaflet map (client-only component)
- Click anywhere to set marker
- Draggable marker for precision
- Display coordinates (lat/lng)
- Display selected address/district
- "Back" button returns to step 2
- "Publish Listing" button submits to Supabase
- Loading state and success/error notifications

#### 6. **LocationMap.tsx** - Client-only map component
- Located in `components/client/` folder
- Imported with `dynamic(() => import(...), { ssr: false })`
- Used in AddPropertyModal step 3
- Handles marker placement and coordinate selection

#### 7. **UserDashboard.tsx** - User submitted properties
- Tabs: Approved, Pending, Rejected
- Property cards with status badges
- Edit/delete buttons per property
- User info section (name, email, phone)
- Submission statistics

#### 8. **AdminDashboard.tsx** - Admin control panel
- Tabs: All Properties, Pending Approval, Approved, Rejected
- Pending tab lists unreviewed submissions
- Approve button (changes status to 'approved')
- Reject button (with reason input modal)
- View Details button
- Delete button
- Quick stats (pending count, total approved)
- Notification bell with unread badge

#### 9. **NotificationCenter.tsx** - Admin notifications
- List of recent property submissions
- Mark read/unread actions
- Clear individual or all notifications
- Badge shows unread count

### UI Components
- **Button.tsx**: Reusable button with variants
- **Input.tsx**: Form input wrapper
- **Modal.tsx**: Base modal container
- **Card.tsx**: Property card container
- **Badge.tsx**: Status badges (pending, approved, rejected, featured)

---

## 🔄 KEY USER WORKFLOWS

### Workflow 1: Browse Properties
1. Land on site → immediately see map of Duhok with clustered property markers
2. Click marker → preview card appears (image, price, basic info)
3. Click "View Details" → side panel slides in with full information
4. View seller contact, click "Call" or "WhatsApp" for direct contact
5. Close panel → back to browsing map

### Workflow 2: Filter Properties
1. Use top navigation filters
2. Type location name → real-time filtering of markers
3. Select property type → markers update instantly
4. Enter price range → filtered results shown
5. Click "Clear Filters" to reset

### Workflow 3: Submit Property (User - requires login)
1. Click "Add Property" button
2. **Step 1**: Upload 3-5 property images (preview shown)
3. **Step 2**: Fill form (title, price, type, area, bedrooms, bathrooms, district, address, description, seller info)
4. **Step 3**: Click on map to set exact location, marker appears with coordinates
5. Click "Publish Listing" → property submitted with status 'pending'
6. Success message → modal closes
7. Property appears in user's dashboard under "Pending" tab
8. Admin receives notification → can approve or reject

### Workflow 4: Admin Approval
1. Admin logs in → sees AdminDashboard
2. Navigate to "Pending Approval" tab
3. Click "View Details" on property to inspect
4. Choose action:
   - **APPROVE**: Click "Approve" → status changes to 'approved' → property appears on public map
   - **REJECT**: Click "Reject" → enter rejection reason → property marked as rejected
   - **DELETE**: Click "Delete" → property removed permanently
5. Pending list updates automatically
6. User receives notification of decision

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### User Roles
- **user** (default): Can submit properties, view own submissions, browse all approved listings
- **admin**: Can approve/reject/delete any property, see all properties, manage workflow

### Authentication Flow
1. User registers via Supabase Auth
2. Trigger automatically creates profile entry with role='user'
3. User logs in → JWT token created and stored in secure HTTP-only cookie
4. Token verified in every request via RLS policies
5. User identity checked with `auth.uid()` in SQL policies

### Protected Routes
- `/dashboard/user` - Requires login, any authenticated user
- `/dashboard/admin` - Requires login + role='admin'

---

## 📍 DUHOK DISTRICTS (Locations)

Include these in dropdowns and filters:
- **Duhok Center** (36.8630, 42.9910) - Main city
- **Zakho** (37.3167, 42.7167) - Northern border city
- **Amadiya** (36.9167, 43.0833) - Mountain area
- **Zawita** (36.9333, 42.8667) - Village area
- **Bardarash** (36.7500, 42.8333) - Southern area
- **Sumel/Semel** (36.5500, 43.0000) - Southeast area
- **Akre/Aqre** (36.8333, 43.2167) - Eastern area

---

## 🎨 DESIGN SYSTEM

### Color Palette
- **Primary Accent**: `#2563EB` (Blue) - Buttons, featured properties, highlights
- **Success**: `#10B981` (Green) - Approved status
- **Warning**: `#F59E0B` (Amber) - Pending status
- **Danger**: `#EF4444` (Red) - Rejected status, delete actions
- **Neutral**: `#6B7280` (Gray) - Text, borders, disabled states
- **Background**: `#FFFFFF` (Light) / `#1F2937` (Dark mode)
- **Surface**: `#F9FAFB` (Light) / `#111827` (Dark mode)

### Typography
- **Headings**: Bold, 2rem (h1), 1.5rem (h2), 1.25rem (h3)
- **Body Text**: Regular, 1rem
- **Small Text**: 0.875rem
- **Font Stack**: System fonts (Segoe UI, Roboto, -apple-system)

### Spacing
- Base unit: 0.25rem (4px in Tailwind)
- Use Tailwind classes: p-2 (8px), p-4 (16px), p-6 (24px)
- Gap between components maintains visual hierarchy

### Border Radius
- Standard: `rounded-lg` (8px)
- Circular: `rounded-full` (99px)
- Subtle: `rounded-md` (6px)

### Shadows
- Subtle: `shadow-sm` - Floating elements
- Standard: `shadow-md` - Cards, modals
- Large: `shadow-lg` - Dropdowns, notifications

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
- **Mobile**: < 640px - Full-screen panels, stacked layout, icon-only nav
- **Tablet**: 640px - 1024px - Narrower side panels
- **Desktop**: > 1024px - Full features, spacious layout

### Mobile Optimizations
- Touch targets minimum 44px (for usability)
- Full-screen property details panel
- Swipe gestures for image galleries
- Hidden navigation labels (icons only on mobile)
- Simplified filter panels
- Stacked form fields

---

## 📦 PROPERTY DATA STRUCTURE

### TypeScript Property Interface
```typescript
export interface Property {
  id: string
  title: string
  description: string
  price: number
  type: 'Apartment' | 'House' | 'Villa' | 'Land' | 'Commercial' | 'Office'
  area: number // in square meters
  bedrooms?: number
  bathrooms?: number
  location: {
    district: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: string[] // array of image URLs
  seller: {
    name: string
    phone: string
    whatsapp: string // optional
    email?: string
  }
  createdAt: Date
  featured?: boolean
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  submittedBy?: string // userId
}
```

### Important: Nested Location Structure
- Properties use **nested** location: `property.location.district`, `property.location.address`, `property.location.coordinates.lat/lng`
- NOT flat structure: `property.district`, `property.address`
- Database columns: `district`, `address`, `latitude`, `longitude`
- Storage layer maps between these structures

---

## 🔄 DATA FLOW & FUNCTIONS

### Key Storage Functions (`utils/propertyStorage.ts`)
```typescript
// Load only approved properties (for public map)
loadProperties(): Promise<Property[]>

// Load all properties (admin dashboard)
loadAllProperties(): Promise<Property[]>

// Load pending properties (admin approval queue)
loadPendingProperties(): Promise<Property[]>

// Load properties by specific user
loadUserProperties(userId: string): Promise<Property[]>

// Add new property (user submission)
addProperty(property: Property): Promise<Property[]>

// Approve property (admin action)
approveProperty(id: string): Promise<boolean>

// Reject property with reason (admin action)
rejectProperty(id: string, reason?: string): Promise<boolean>

// Delete property permanently (admin action)
deleteProperty(id: string): Promise<boolean>

// Update property fields
updateProperty(id: string, updates: Partial<Property>): Promise<boolean>

// Get pending count for admin badge
getPendingCount(): Promise<number>

// Notifications functions
loadNotifications(): Promise<Notification[]>
markNotificationRead(id: string): Promise<void>
markAllNotificationsRead(): Promise<void>
clearNotifications(): Promise<void>
getUnreadCount(): Promise<number>
```

### Data Mapping
- **Client ↔ Database**: `mapPropertyToDbProperty()` and `mapDbPropertyToProperty()`
- Handles coordinate conversion, field name translation
- Automatic on all queries and updates

---

## 🌐 SUPABASE INTEGRATION

### Environment Variables (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Supabase Client Setup (`utils/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Key Operations
- **Insert**: User submits property → `properties.insert([dbProperty]).select()`
- **Select**: Load approved → `properties.select().eq('status', 'approved')`
- **Update**: Admin approves → `properties.update({ status: 'approved' }).eq('id', id)`
- **Delete**: Remove property → `properties.delete().eq('id', id)`
- **Auth**: Handled by Supabase Auth middleware

---

## 🚀 FEATURES CHECKLIST

- [ ] Full-screen interactive map centered on Duhok
- [ ] Property markers with custom styling and clustering
- [ ] Dark mode with persistent preference
- [ ] Search by location (district/address) with real-time filtering
- [ ] Filter by property type and price range
- [ ] Property preview cards on marker click
- [ ] Full property details side panel
- [ ] Image gallery with swipe support
- [ ] 3-step property submission wizard
- [ ] Map-based location selection for new properties
- [ ] User registration and login (Supabase Auth)
- [ ] User dashboard showing submitted properties
- [ ] Admin dashboard with approval workflow
- [ ] Approve/reject properties with admin notifications
- [ ] Direct contact buttons (phone, WhatsApp)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Image upload to Supabase Storage
- [ ] Notification system for admins
- [ ] Role-based access control (user/admin)
- [ ] SSR-safe client component imports
- [ ] Production deployment ready

---

## 🔌 SUPABASE SETUP STEPS

1. **Create Account**: Go to supabase.com, sign up
2. **Create Project**: Name it "duhok-real-estate", choose region close to Iraq
3. **Get Credentials**: Copy Project URL and anon key from Settings → API
4. **Create Tables**: Copy `supabase/schema.sql` content, paste in SQL Editor, run it
5. **Create Admin User**: In Auth → Users, add a user, then run SQL to set role='admin'
6. **Configure Storage**: Create bucket "property-images", make it public
7. **Add to .env.local**: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
8. **Test Connection**: Run app, check browser console for errors

---

## 📁 PROJECT FILE STRUCTURE

```
duhok-real-estate/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main map page
│   └── globals.css                # Global styles
├── components/
│   ├── Map.tsx                    # Main map
│   ├── Navigation.tsx             # Top nav bar
│   ├── PropertyPreviewCard.tsx    # Marker preview
│   ├── PropertyDetails.tsx        # Side panel
│   ├── AddPropertyModal.tsx       # 3-step form
│   ├── UserDashboard.tsx          # User properties
│   ├── AdminDashboard.tsx         # Admin controls
│   ├── NotificationCenter.tsx     # Notifications
│   ├── client/
│   │   └── LocationMap.tsx        # Client-only map
│   └── UI/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── context/
│   └── AppContext.tsx             # Global state
├── hooks/
│   ├── useAuth.ts                 # Auth hooks
│   ├── useProperties.ts           # Property queries
│   └── useTheme.ts                # Dark mode
├── utils/
│   ├── supabase.ts                # Supabase client
│   ├── propertyStorage.ts         # Data functions
│   ├── filters.ts                 # Filter logic
│   └── validation.ts              # Form validation
├── types/
│   └── property.ts                # TypeScript types
├── data/
│   └── districts.ts               # Duhok districts
├── public/
│   └── icon-192.png, icon-512.png # PWA icons
├── supabase/
│   └── schema.sql                 # Database schema
├── .env.local                     # Environment vars
├── .env.example                   # Example template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🧪 TESTING CHECKLIST

### Functional Tests
- [ ] Map loads and displays markers
- [ ] Clustering works when zoomed out
- [ ] Click marker shows preview card
- [ ] View Details opens side panel
- [ ] Filters update markers in real-time
- [ ] Dark mode toggles all components
- [ ] Add Property modal 3 steps flow correctly
- [ ] Form validation prevents invalid submission
- [ ] Property submits to Supabase and appears as pending
- [ ] Admin dashboard shows pending properties
- [ ] Admin can approve property (changes status to approved)
- [ ] Admin can reject with reason (property shows reason to user)
- [ ] Approved properties appear on public map
- [ ] User dashboard shows correct tabs (approved, pending, rejected)
- [ ] Contact buttons (call, WhatsApp) work
- [ ] Images upload and display correctly
- [ ] Search/filter functionality works
- [ ] Notifications appear for admins

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Device Tests
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad dimensions - 768x1024)
- [ ] Mobile (iPhone 12 - 390x844)

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### SSR & Dynamic Imports
- **LocationMap** component MUST be in `components/client/` folder
- Import it with: `const LocationMap = dynamic(() => import('./client/LocationMap'), { ssr: false })`
- Do NOT use "use client" directive with Next.js 14 dynamic imports (causes conflicts)
- Regular components can import Map with standard import

### Data Structure
- Properties use NESTED location: `location.district`, `location.address`, `location.coordinates.lat/lng`
- NOT flat: `property.district` (this is wrong)
- Database columns are: `district`, `address`, `latitude`, `longitude`
- Storage layer handles the mapping automatically

### Image Handling
- Upload to Supabase Storage bucket "property-images"
- Store URLs in `images` JSONB array in database
- Use Next.js Image component for optimization
- Lazy load in gallery, don't load all at once

### Authentication Flow
- Supabase Auth creates and manages JWT tokens
- Tokens stored in secure HTTP-only cookies automatically
- User session stored in AppContext for component access
- RLS policies enforce all data access control
- No need for backend API routes for data access

### Performance Tips
- Marker clustering prevents rendering 100+ markers at once
- Lazy load components with dynamic imports
- Cache queries with React Query or Next.js cache
- Optimize images before uploading
- Use indexes on: status, submitted_by, created_at

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Deploy
- [ ] `npm run build` passes without errors
- [ ] TypeScript strict mode has no errors
- [ ] ESLint passes: `npm run lint`
- [ ] All environment variables configured
- [ ] Supabase schema created and running
- [ ] Storage bucket created and made public
- [ ] RLS policies configured correctly
- [ ] Test user and admin accounts created
- [ ] Images tested with real URLs
- [ ] Dark mode works perfectly
- [ ] Responsive design tested on mobile
- [ ] All links and buttons tested
- [ ] Form submissions tested end-to-end
- [ ] Admin approval workflow tested

### Deploy to Vercel
1. Push code to GitHub
2. Go to vercel.com → "Import Project"
3. Connect GitHub, select repository
4. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Click "Deploy"
6. Configure custom domain (optional)
7. Enable automatic deployments from main branch

### Post-Deployment
- [ ] Test deployed URL works
- [ ] Forms submit to production database
- [ ] Images load correctly
- [ ] Map functions properly
- [ ] Dark mode works
- [ ] Admin workflow works
- [ ] Mobile responsive works
- [ ] Set up monitoring/error tracking
- [ ] Configure Google Search Console
- [ ] Set up analytics

---

## 📞 DOCUMENTATION REFERENCE

- **Setup Guide**: See SUPABASE_SETUP.md for complete database configuration
- **Deployment Guide**: See DEPLOYMENT.md for step-by-step deployment instructions
- **Features Overview**: See FEATURES.md for detailed feature descriptions
- **Troubleshooting**: See TROUBLESHOOTING.md for common issues and solutions

---

**This prompt contains all information needed to recreate the Duhok Real Estate application from scratch.**

**Last Updated**: August 15, 2026  
**Version**: 1.0 - Production Ready  
**Status**: Complete System Specification
