# 🎨 Customization Guide

How to customize the Duhok Real Estate application for your needs.

---

## 🎯 Quick Customizations

### Change Brand Colors

**File:** `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      primary: "#111827",    // Change to your primary color
      accent: "#2563EB",     // Change to your accent color
      success: "#22C55E",    // Success messages
      danger: "#EF4444",     // Error messages
    },
  },
},
```

**Example - Make it Green-themed:**
```typescript
colors: {
  primary: "#065F46",      // Dark Green
  accent: "#10B981",       // Emerald Green
  success: "#22C55E",      // Keep success green
  danger: "#EF4444",       // Keep danger red
},
```

---

### Change Fonts

**File:** `tailwind.config.ts`

```typescript
fontFamily: {
  sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
  // Add custom fonts:
  heading: ["Poppins", "sans-serif"],
  body: ["Roboto", "sans-serif"],
},
```

**Then import in** `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Roboto:wght@400;500&display=swap');
```

---

### Change Map Center Location

**File:** `data/properties.ts`

```typescript
export const DUHOK_CENTER = {
  lat: 36.8630,  // Your latitude
  lng: 42.9910,  // Your longitude
};
```

**To find coordinates:**
1. Go to Google Maps
2. Right-click your location
3. Click the coordinates to copy
4. Paste into the file

---

### Change Site Metadata

**File:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "Your Site Name",
  description: "Your description",
};
```

---

## 🏠 Adding Real Property Data

### Replace Sample Data

**File:** `data/properties.ts`

**Option 1: Manual Entry**

```typescript
export const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Your Property Title",
    description: "Your description...",
    price: 150000,
    type: "Apartment",
    area: 120,
    bedrooms: 3,
    bathrooms: 2,
    district: "Your District",
    address: "Your Address",
    location: {
      lat: 36.8630,
      lng: 42.9910,
    },
    images: [
      "/images/property1.jpg",  // Use your images
      "/images/property2.jpg",
    ],
    seller: {
      name: "John Doe",
      phone: "+964 750 123 4567",
      whatsapp: "+964 750 123 4567",
    },
    createdAt: new Date(),
    featured: false,
  },
  // Add more properties...
];
```

**Option 2: Load from API**

Create `app/api/properties/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch from your database
  const properties = await fetchFromDatabase();
  return NextResponse.json(properties);
}
```

Then update `app/page.tsx`:

```typescript
const [properties, setProperties] = useState([]);

useEffect(() => {
  fetch('/api/properties')
    .then(res => res.json())
    .then(data => setProperties(data));
}, []);
```

---

## 🖼️ Using Your Own Images

### Option 1: Use Public Folder

1. Create `public/images/` folder
2. Add your images there
3. Reference as `/images/your-photo.jpg`

```typescript
images: [
  "/images/apartment1.jpg",
  "/images/apartment2.jpg",
]
```

### Option 2: Use Image CDN

1. Upload images to a CDN (Cloudinary, AWS S3, etc.)
2. Add domain to `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    domains: [
      'your-cdn.com',
      'images.your-site.com',
    ],
  },
};
```

3. Use full URLs in data:

```typescript
images: [
  "https://your-cdn.com/property1.jpg",
  "https://your-cdn.com/property2.jpg",
]
```

---

## 🎨 Styling Customizations

### Change Navigation Style

**File:** `components/Navigation.tsx`

**Make it fixed full-width:**
```typescript
<nav className="fixed top-0 left-0 right-0 z-[1000] bg-white dark:bg-gray-800 shadow-lg">
  <div className="container mx-auto px-4 py-4">
    {/* Navigation content */}
  </div>
</nav>
```

**Make it transparent:**
```typescript
<nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
```

---

### Change Property Card Design

**File:** `components/PropertyPreviewCard.tsx`

**Add more info:**
```typescript
<div className="p-4">
  {/* Existing content */}
  
  {/* Add new section */}
  <div className="mt-3 pt-3 border-t border-gray-200">
    <p className="text-sm text-gray-500">
      Listed {property.createdAt.toLocaleDateString()}
    </p>
  </div>
</div>
```

**Change image size:**
```typescript
<div className="relative h-64 w-full"> {/* Was h-48 */}
```

---

### Customize Marker Colors

**File:** `components/Map.tsx`

```typescript
const createCustomIcon = (type: string, featured?: boolean) => {
  // Change colors based on property type
  let color = "#111827"; // Default
  
  if (featured) color = "#2563EB";  // Blue for featured
  else if (type === "Villa") color = "#9333EA";  // Purple for villas
  else if (type === "Land") color = "#10B981";   // Green for land
  
  return L.divIcon({
    // ... rest of code
    html: `<div style="background-color: ${color}; ...">`,
  });
};
```

---

## 🗺️ Map Customizations

### Change Map Style

**File:** `components/Map.tsx`

**Different tile providers:**

```typescript
{/* Light Mode Options */}

{/* Option 1: OpenStreetMap (default) */}
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

{/* Option 2: OpenStreetMap HOT (humanitarian) */}
<TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

{/* Option 3: CartoDB Positron (minimal) */}
<TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

{/* Dark Mode Options */}

{/* Option 1: CartoDB Dark Matter (default) */}
<TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

{/* Option 2: Dark tiles */}
<TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
```

### Change Initial Zoom Level

**File:** `components/Map.tsx`

```typescript
<MapContainer
  center={mapCenter}
  zoom={10}  // Change this: 1-20 (higher = closer)
  scrollWheelZoom={true}
>
```

**Recommended zoom levels:**
- City view: 10-12
- District view: 13-14
- Street view: 15-17

### Disable Scroll Zoom

**File:** `components/Map.tsx`

```typescript
<MapContainer
  scrollWheelZoom={false}  // Disable scroll zoom
  // Or require Ctrl key:
  scrollWheelZoom="center"
>
```

---

## 🔍 Filter Customizations

### Add More Property Types

**File:** `types/property.ts`

```typescript
export type PropertyType = 
  | "Apartment" 
  | "House" 
  | "Villa" 
  | "Land" 
  | "Commercial" 
  | "Office"
  | "Penthouse"    // Add new types
  | "Studio"
  | "Duplex";
```

Then update `components/Navigation.tsx`:

```typescript
const propertyTypes: (PropertyType | "All")[] = [
  "All",
  "Apartment",
  "House",
  "Villa",
  "Land",
  "Commercial",
  "Office",
  "Penthouse",  // Add here too
  "Studio",
  "Duplex",
];
```

### Add More Filters

**File:** `types/property.ts`

```typescript
export interface PropertyFilters {
  type?: PropertyType | "All";
  minPrice?: number;
  maxPrice?: number;
  searchLocation?: string;
  // Add new filters:
  minBedrooms?: number;
  maxBedrooms?: number;
  minArea?: number;
  maxArea?: number;
  featured?: boolean;
}
```

Then add filter UI in `components/Navigation.tsx` and logic in `utils/filters.ts`.

---

## 📱 Mobile Customizations

### Change Mobile Breakpoints

**File:** `tailwind.config.ts`

```typescript
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
    // Add custom breakpoints:
    'mobile': '480px',
    'tablet': '768px',
    'desktop': '1024px',
  },
},
```

### Mobile-Specific Styles

Use Tailwind responsive prefixes:

```typescript
<div className="
  text-sm         /* mobile */
  md:text-base    /* tablet */
  lg:text-lg      /* desktop */
">
```

---

## 🌙 Dark Mode Customizations

### Change Dark Mode Colors

**File:** `app/globals.css` or component files

```css
/* Custom dark mode colors */
.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #1a1a1a;
}
```

### Auto-Detect System Preference

**File:** `context/AppContext.tsx`

```typescript
const [darkMode, setDarkMode] = useState(() => {
  // Check system preference
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
});
```

---

## ⚡ Performance Customizations

### Adjust Image Quality

**File:** `next.config.mjs`

```javascript
const nextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
  },
};
```

### Optimize Build

**File:** `next.config.mjs`

```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  swcMinify: true,
};
```

---

## 🔧 Feature Customizations

### Disable Clustering

**File:** `components/Map.tsx`

Remove or comment out `MarkerClusterGroup`:

```typescript
{/* Remove clustering */}
{properties.map((property) => (
  <Marker key={property.id} position={[...]} />
))}
```

### Add Property Favoriting

**File:** `types/property.ts`

```typescript
export interface Property {
  // ... existing fields
  isFavorite?: boolean;
}
```

Add favorite button in `components/PropertyPreviewCard.tsx`:

```typescript
import { Heart } from "lucide-react";

<button onClick={handleFavorite}>
  <Heart className={isFavorite ? "fill-red-500" : ""} />
</button>
```

### Add Property Rating

```typescript
export interface Property {
  // ... existing fields
  rating?: number;
  reviews?: number;
}
```

Display in card:

```typescript
<div className="flex items-center gap-1">
  <Star className="w-4 h-4 fill-yellow-400" />
  <span>{property.rating}</span>
  <span className="text-gray-500">({property.reviews})</span>
</div>
```

---

## 🎭 Animation Customizations

### Change Animation Speed

**File:** `app/globals.css`

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;  /* Change from 0.3s */
}
```

### Disable Animations

```css
* {
  transition: none !important;
  animation: none !important;
}
```

Or use `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🌐 Multi-Language Support

### Setup i18n

1. Install next-intl:
```bash
npm install next-intl
```

2. Create `messages/` folder with language files:

```typescript
// messages/en.json
{
  "nav": {
    "search": "Search by location...",
    "addProperty": "Add Property"
  }
}

// messages/ar.json
{
  "nav": {
    "search": "البحث حسب الموقع...",
    "addProperty": "إضافة عقار"
  }
}
```

3. Use translations:

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('nav');
<input placeholder={t('search')} />
```

---

## 🔐 Add Authentication

### Using NextAuth.js

1. Install:
```bash
npm install next-auth
```

2. Create `app/api/auth/[...nextauth]/route.ts`

3. Add auth provider in `app/layout.tsx`

4. Protect routes and features

---

## 📊 Add Analytics

### Google Analytics

**File:** `app/layout.tsx`

```typescript
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
  <script dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_ID');
    `
  }} />
</head>
```

---

## 🎨 Complete Theme Example

**Purple & Gold Theme:**

```typescript
// tailwind.config.ts
colors: {
  primary: "#4C1D95",     // Deep Purple
  accent: "#F59E0B",      // Amber/Gold
  success: "#10B981",     // Emerald
  danger: "#EF4444",      // Red
}

// Custom gradient backgrounds
.bg-gradient-theme {
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
}
```

---

**Remember:** After any customization, restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Happy customizing! 🎨✨**
