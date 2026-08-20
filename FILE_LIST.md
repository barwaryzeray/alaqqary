# 📁 Complete File List

All files in the Duhok Real Estate project with descriptions.

---

## 📋 Configuration Files

### `package.json`
- Project metadata and dependencies
- Scripts for dev, build, start, lint
- Contains all npm packages

### `tsconfig.json`
- TypeScript configuration
- Compiler options
- Path aliases (@/*)

### `tailwind.config.ts`
- Tailwind CSS configuration
- Custom colors (accent, primary, success, danger)
- Dark mode setup
- Font families

### `postcss.config.mjs`
- PostCSS configuration
- Tailwind and Autoprefixer plugins

### `next.config.mjs`
- Next.js configuration
- Image domains (Unsplash, etc.)
- Build settings

### `.eslintrc.json`
- ESLint configuration
- Next.js core web vitals rules

### `.gitignore`
- Files to exclude from Git
- node_modules, .next, build files

---

## 🎨 App Directory

### `app/layout.tsx`
- Root layout component
- HTML and body structure
- Metadata (title, description)
- Global font settings

### `app/page.tsx`
- Main page component
- Map-first interface
- AppProvider wrapper
- Dynamic Map import
- Filter logic

### `app/globals.css`
- Global CSS styles
- Tailwind directives
- Custom animations
- Leaflet overrides
- Scrollbar styling
- Font imports

### `app/favicon.ico`
- Website favicon (placeholder)
- Replace with actual logo

---

## 🧩 Components

### `components/Map.tsx`
- Main interactive map component
- MapContainer from React Leaflet
- Custom markers with icons
- Marker clustering
- Tile layer (OpenStreetMap)
- Dark mode tile switching
- Click handlers for markers
- Map center updates

### `components/Navigation.tsx`
- Floating top navigation bar
- Logo and brand name
- Location search input
- Property type dropdown filter
- Price range filter (min/max)
- Add Property button
- Dark mode toggle (sun/moon icon)
- User profile icon
- Responsive design

### `components/PropertyPreviewCard.tsx`
- Property preview popup card
- Appears when marker is clicked
- Property image
- Price display
- Quick info (type, area, district)
- "View Details" button
- Featured badge for featured properties

### `components/PropertyDetails.tsx`
- Full property details side panel
- Slides in from right
- Image gallery with navigation
- Property information
- Feature grid (bedrooms, bathrooms, area, type)
- Full description
- District badge
- Seller information
- Contact buttons (Call, WhatsApp)
- Embedded location map
- Close button

### `components/AddPropertyModal.tsx`
- Add new property modal
- 3-step wizard interface
- Progress indicator
- Step 1: Photo upload (drag & drop)
- Step 2: Property details form
- Step 3: Map location picker
- Form validation
- Success message
- Close functionality

---

## 🔧 Context

### `context/AppContext.tsx`
- Global state management
- React Context API
- State for:
  - Selected property
  - Show/hide property details
  - Show/hide add property modal
  - Filters (type, price, location)
  - Dark mode toggle
- Custom useApp hook

---

## 📊 Data

### `data/properties.ts`
- Sample property data
- 10 properties across Duhok districts
- Property object structure:
  - id, title, description
  - price, type, area
  - bedrooms, bathrooms
  - district, address
  - location (lat, lng)
  - images array
  - seller info (name, phone, WhatsApp)
  - createdAt date
  - featured flag
- DUHOK_CENTER coordinates

---

## 🏷️ Types

### `types/property.ts`
- TypeScript type definitions
- PropertyType enum:
  - Apartment, House, Villa
  - Land, Commercial, Office
- Property interface (full structure)
- PropertyFilters interface:
  - type, minPrice, maxPrice
  - searchLocation

---

## 🛠️ Utils

### `utils/filters.ts`
- Utility functions
- filterProperties(): Filter properties by criteria
- formatPrice(): Format price as USD currency
- formatArea(): Format area in square meters

---

## 📚 Documentation Files

### `README.md`
- Main project documentation
- Features overview
- Tech stack
- Getting started guide
- Project structure
- Usage instructions
- Customization guide
- Sample data info
- Build instructions

### `QUICKSTART.md`
- Quick start guide
- 3-step setup process
- Feature highlights
- Sample data locations
- Troubleshooting basics
- Next steps

### `FEATURES.md`
- Detailed feature documentation
- Core concept explanation
- Main features breakdown
- Design philosophy
- Performance features
- Mobile optimizations
- User experience highlights
- Future enhancement ideas

### `DEPLOYMENT.md`
- Complete deployment guide
- Vercel deployment (recommended)
- Netlify deployment
- Docker deployment
- VPS deployment (DigitalOcean, AWS)
- Environment variables
- Performance optimization
- CI/CD setup
- PWA configuration
- Pre-deployment checklist

### `PROJECT_SUMMARY.md`
- High-level project overview
- Technology stack table
- Component architecture diagram
- Design system details
- Responsive breakpoints
- Map configuration
- Performance metrics
- Future enhancements roadmap
- Browser support

### `TROUBLESHOOTING.md`
- Common issues and solutions
- Installation problems
- Development server issues
- Map problems
- Styling issues
- Image issues
- Mobile issues
- Build problems
- Browser issues
- Performance issues
- Debugging tips

### `FILE_LIST.md` (this file)
- Complete file inventory
- File descriptions
- Organization structure

---

## 🖥️ Scripts

### `install.bat`
- Windows batch script
- Runs npm install
- User-friendly installer

### `start.bat`
- Windows batch script
- Runs npm run dev
- Starts development server

---

## 📦 File Count Summary

| Category | Count |
|----------|-------|
| Configuration Files | 6 |
| App Files | 4 |
| Components | 5 |
| Context | 1 |
| Data | 1 |
| Types | 1 |
| Utils | 1 |
| Documentation | 7 |
| Scripts | 2 |
| **Total** | **28** |

---

## 📏 Code Statistics

### Lines of Code (Approximate):

| File | Lines |
|------|-------|
| Map.tsx | ~180 |
| PropertyDetails.tsx | ~250 |
| AddPropertyModal.tsx | ~450 |
| Navigation.tsx | ~150 |
| PropertyPreviewCard.tsx | ~70 |
| properties.ts | ~250 |
| globals.css | ~100 |
| **Other files** | ~500 |
| **Total** | ~1,950 |

---

## 🎯 File Purpose Summary

### Essential Files (Cannot Delete):
- package.json
- tsconfig.json
- tailwind.config.ts
- next.config.mjs
- app/layout.tsx
- app/page.tsx
- app/globals.css

### Core Functionality:
- components/Map.tsx
- components/Navigation.tsx
- data/properties.ts
- context/AppContext.tsx
- types/property.ts

### User Experience:
- components/PropertyPreviewCard.tsx
- components/PropertyDetails.tsx
- components/AddPropertyModal.tsx
- utils/filters.ts

### Documentation (Helpful but optional):
- All .md files
- .bat scripts

---

## 📝 Notes

### Files to Replace in Production:

1. **app/favicon.ico** - Add your real logo
2. **data/properties.ts** - Replace with real property data
3. **Sample images** - Use actual property photos

### Files to Configure:

1. **next.config.mjs** - Add your image CDN domains
2. **tailwind.config.ts** - Customize colors/fonts
3. **app/layout.tsx** - Update metadata

### Files to Extend:

1. Create **app/api/** folder for backend routes
2. Add **public/** folder for static assets
3. Create **lib/** folder for additional utilities
4. Add **hooks/** folder for custom React hooks

---

## 🔍 Quick File Reference

**Need to change colors?** → `tailwind.config.ts`  
**Need to add properties?** → `data/properties.ts`  
**Need to modify map?** → `components/Map.tsx`  
**Need to change layout?** → `app/page.tsx`  
**Need to add routes?** → Create `app/[route]/page.tsx`  
**Need to add API?** → Create `app/api/[route]/route.ts`  

---

**All files are well-organized and documented! 📚✨**
