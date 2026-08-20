# Page Elements When Opening the Map

## Main Components (Always Rendered)

### 1. **Navigation Component**
   - Property type selector dropdown
   - Price range filter button + dropdown
   - Add Property button
   - Dark mode toggle button
   - User menu / Auth button (Sign In or User avatar)
   - **Location**: Fixed top-right corner (z-index: 1000)

### 2. **Map Component** 
   - Google Map container (full screen)
   - Property markers (one per approved property)
   - User location marker (if geolocation enabled)
   - Info window (appears when clicking a marker)
   - **Location**: Full viewport background

### 3. **PropertyDetails Component**
   - Modal for viewing property details
   - **State**: Hidden by default, shows when clicking a property marker
   - Contains: Images, price, type, area, location map, seller info

### 4. **AddPropertyModal Component**
   - Modal for adding new properties
   - **State**: Hidden by default, shows when clicking "Add Property" button
   - Contains: Image upload, property details form, seller info

## Optional Modals (In Navigation)

### Inside Navigation Component:
1. **AuthModal** - Login/signup form
2. **AdminDashboard** - Admin panel for approving listings
3. **UserDashboard** - User's property listings

## Total Elements Summary

| Component | Always Visible | Type | Purpose |
|-----------|----------------|------|---------|
| Navigation | Yes | Fixed Bar | Filters, auth, add property |
| Map | Yes | Full Screen | Display properties |
| PropertyDetails | No (Modal) | Overlay | View property details |
| AddPropertyModal | No (Modal) | Overlay | Submit new property |
| AuthModal | No (Modal) | Overlay | Login/signup |
| AdminDashboard | No (Modal) | Overlay | Admin functions |
| UserDashboard | No (Modal) | Overlay | User functions |

## Elements Count by Size

**Lightweight (Initial Load):**
- 2 always-visible components (Navigation + Map)
- Map initially has: 1 user marker + N property markers (N = number of approved properties)

**Full Page Elements:**
- 4-7 total components (including optional modals)
- Modals are only rendered when needed (conditionally mounted)

## Performance Considerations

✓ Map is dynamically loaded (lazy loading)
✓ Modals are conditionally rendered (not in DOM until opened)
✓ Navigation is lightweight (just filters and buttons)
✓ Property markers rendered efficiently by Google Maps API

**Typical startup:**
1. Map loads dynamically (~2-3 seconds)
2. Navigation mounts immediately
3. Properties fetched and markers rendered
4. Modals only created when user interactions trigger them
