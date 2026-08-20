# Google Maps Migration Guide

## Overview
Your map has been successfully migrated from React Leaflet (OpenStreetMap) to Google Maps, which provides more detailed satellite imagery and better visual details.

## Changes Made

### 1. **Dependencies Updated** (`package.json`)
- **Removed:**
  - `react-leaflet` (^4.2.1)
  - `leaflet` (^1.9.4)
  - `react-leaflet-cluster` (^2.1.0)
  - `@types/leaflet` (^1.9.11)

- **Added:**
  - `@react-google-maps/api` (^2.20.8) - React wrapper for Google Maps API
  - `@types/google.maps` (^3.56.9) - TypeScript types for Google Maps

### 2. **Files Modified**

#### `components/Map.tsx`
- Replaced React Leaflet with Google Maps
- Updated marker icons to Google Maps style
- Added dark mode support with custom styles
- User location marker now shows as a blue circle
- Property markers display as custom SVG pins
- InfoWindow replaces popups for better UX

#### `components/client/LocationMap.tsx`
- Replaced OpenStreetMap iframe with interactive Google Map
- Added click-to-select functionality
- Map defaults to hybrid view (satellite + labels)
- Coordinate inputs still available for precise placement

#### `.env.example`
- Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configuration

## Setup Instructions

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable these APIs:
   - **Maps JavaScript API** - for interactive maps
   - **Maps Embed API** - for embed functionality
4. Create credentials (API Key)
5. Restrict the key to your domain (optional but recommended)

### Step 2: Update Environment Variables

Update your `.env.local` file:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### Step 3: Install Dependencies

Delete existing `node_modules` and reinstall:

```bash
# PowerShell
Remove-Item -Recurse -Force node_modules
npm install
```

Or run this in your terminal:

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

### Main Map (`components/Map.tsx`)

✅ **Interactive Google Map**
- Zoom and pan controls
- Satellite view toggle
- Street view option
- Fullscreen mode
- Dark mode auto-detection

✅ **Property Markers**
- Red markers for regular properties
- Blue markers for featured properties
- Custom SVG icons for visual consistency
- Click to view property details
- InfoWindow popup with property preview

✅ **User Location**
- Auto-detect user's location
- Blue circle marker for user's position
- Graceful fallback if geolocation denied

✅ **Responsive Design**
- Works on all screen sizes
- Touch-friendly controls
- Optimized for mobile

### Location Picker (`components/client/LocationMap.tsx`)

✅ **Interactive Selection**
- Click anywhere on map to select location
- Manual latitude/longitude input for precision
- Real-time coordinate updates
- Hybrid satellite + labels view

✅ **Quick Access**
- "Open in Google Maps" button
- Direct link to selected coordinates

## Troubleshooting

### "Google Maps API key not configured"

**Solution:** Make sure your `.env.local` file includes:
```plaintext
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key
```

Then restart your development server (`npm run dev`).

### Map Not Loading / Blank Screen

**Causes & Solutions:**

1. **API Key Invalid or Restricted:**
   - Verify key is active in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Check API restrictions (should allow Maps JavaScript API)
   - Check domain restrictions (localhost should be unrestricted in development)

2. **Required APIs Not Enabled:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
   - Search for and enable:
     - Maps JavaScript API
     - Maps Embed API

3. **Domain/IP Restrictions:**
   - For development, unrestrict the key or add localhost
   - For production, add your domain

### Performance Issues

- Google Maps with many markers can be slow
- Consider implementing clustering for 100+ properties
- Use marker icons efficiently

### Billing Concerns

Google Maps has a free tier, but:
- First $200/month free (auto-applied)
- After that, usage-based pricing applies
- Monitor in [Google Cloud Console](https://console.cloud.google.com/billing)

## Migration Checklist

- ✅ Dependencies updated
- ✅ Map component converted
- ✅ Location picker converted
- ✅ Environment variables documented
- ✅ TypeScript types added
- ⏳ API key added to `.env.local` (you need to do this)
- ⏳ Dependencies installed (`npm install`)
- ⏳ Development server tested (`npm run dev`)

## Rollback Instructions

If you need to revert to Leaflet/OpenStreetMap:

```bash
git revert HEAD~1  # Revert the last commit
npm install        # Reinstall original dependencies
npm run dev        # Test
```

Or manually:

1. Restore original `components/Map.tsx` and `components/client/LocationMap.tsx`
2. Restore original dependencies in `package.json`
3. Run `npm install`

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps Wrapper Documentation](https://react-google-maps-api-docs.netlify.app/)
- [Google Cloud Console](https://console.cloud.google.com)

## Support

If you encounter issues:

1. Check the browser console (F12) for errors
2. Verify API key in `.env.local`
3. Check network tab to see if API calls are succeeding
4. Review [Google Maps status page](https://status.cloud.google.com/)
