# Google Maps Integration Checklist

## Pre-Setup Verification ✅

- [x] React Leaflet dependencies removed from `package.json`
- [x] Google Maps API dependency added to `package.json`
- [x] Google Maps types added to dev dependencies
- [x] `components/Map.tsx` converted to Google Maps
- [x] `components/client/LocationMap.tsx` converted to Google Maps
- [x] `.env.example` updated with API key placeholder
- [x] TypeScript configuration verified
- [x] All imports properly updated
- [x] No Leaflet CSS imports remaining

## Before You Start 🚀

**Do this FIRST:**

- [ ] Visit https://console.cloud.google.com
- [ ] Create a new project or select existing one
- [ ] Enable "Maps JavaScript API"
- [ ] Go to Credentials → Create API Key
- [ ] Copy your API key
- [ ] Open `.env.local` in your project
- [ ] Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-key-here`
- [ ] Save the file
- [ ] Delete `node_modules` folder (optional but recommended)
- [ ] Run `npm install` in terminal
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000

## Quick Testing ✓

After setup, verify:

### Map Display
- [ ] Map appears on page without errors
- [ ] Can scroll/pan around
- [ ] Zoom buttons work
- [ ] Map controls visible (top right)

### Markers
- [ ] Property markers visible on map
- [ ] Markers are correct colors (red/blue)
- [ ] Can click markers
- [ ] Info window shows property details

### Features
- [ ] Can toggle map type (satellite, road, hybrid)
- [ ] Can use fullscreen mode
- [ ] Dark mode works correctly
- [ ] Responsive on mobile (test in DevTools)

### Location Picker
- [ ] Open "Add Property" modal
- [ ] Location picker shows map
- [ ] Can click map to select location
- [ ] Coordinates update in real-time
- [ ] Coordinate inputs work
- [ ] "Open in Google Maps" link works

### Browser Console
- [ ] No red errors
- [ ] No API key warnings
- [ ] No React errors
- [ ] Network tab shows successful API calls

## Development Verification 🧪

### TypeScript
```bash
# Should have no errors
npx tsc --noEmit
```

### Lint Check
```bash
# Should pass
npm run lint
```

### Build Test
```bash
# Should build successfully
npm run build
```

## Troubleshooting Guide 🆘

### Issue: "Loading map..." stays on screen

**Check:**
1. Is API key correct? (copy-paste from Google Cloud)
2. Is API key in `.env.local`? (not `.env.example`)
3. Did you restart `npm run dev`?
4. Check browser console (F12) for errors

**Fix:**
```bash
# Restart dev server
npm run dev
```

### Issue: Map shows but markers not visible

**Check:**
1. Do you have properties in your database?
2. Are property coordinates valid?
3. Check browser console for errors

**Fix:**
```bash
# Check properties are loading
# Open DevTools → Application → localStorage
# Look for properties data
```

### Issue: "Maps JavaScript API is not available"

**Fix:**
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Maps JavaScript API"
3. Enable it
4. Wait 1-2 minutes
5. Restart dev server

### Issue: API key restriction errors

**Fix:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Click your API key
3. Set "Application restrictions" to "None"
4. Save and wait 2 minutes

### Issue: Build fails or dev server won't start

**Fix:**
```bash
# Clean everything
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Fresh install
npm install
npm run dev
```

## Performance Checklist 📊

- [ ] Initial load time < 3 seconds
- [ ] Smooth map panning
- [ ] Smooth zoom animations
- [ ] No lag when clicking markers
- [ ] Mobile performs well (test on actual phone)

## Security Checklist 🔒

- [ ] API key in `.env.local` (never commit)
- [ ] `.env.local` in `.gitignore` ✓
- [ ] API key restricted to Maps JavaScript API
- [ ] For production: restrict to your domain
- [ ] Monitoring set up in Google Cloud Console

## Deployment Checklist 📦

### Before Production:

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Build succeeds: `npm run build`
- [ ] Production API key created
- [ ] Production API key restricted to domain
- [ ] Added to production `.env.local`
- [ ] Billing alerts configured
- [ ] Environment variables documented

### Production Deployment:

- [ ] Deploy to your hosting
- [ ] Verify map works on production domain
- [ ] Test from different locations (VPN)
- [ ] Monitor API usage first 24 hours

## Documentation Checklist 📚

- [x] GOOGLE_MAPS_SETUP.md - Quick start
- [x] GOOGLE_MAPS_MIGRATION_GUIDE.md - Detailed guide
- [x] GOOGLE_MAPS_IMPLEMENTATION_SUMMARY.md - What changed
- [x] This checklist - Verification steps

## After Setup 🎯

- [ ] Team members updated on changes
- [ ] Documentation shared with team
- [ ] Team given API key (if needed)
- [ ] Testing plan created
- [ ] Deployment plan created

## Success Criteria ✨

**Your integration is successful when:**

✅ Map loads immediately  
✅ Property markers visible  
✅ Clicking markers shows details  
✅ Location picker works  
✅ No console errors  
✅ Mobile responsive  
✅ Dark mode works  
✅ Performance is good  

## Still Having Issues?

1. **Check files:**
   ```bash
   # Verify Map.tsx exists
   Get-Item components/Map.tsx
   
   # Verify LocationMap.tsx exists
   Get-Item components/client/LocationMap.tsx
   ```

2. **Check environment:**
   ```bash
   # Verify API key is set
   Get-Content .env.local
   ```

3. **Check dependencies:**
   ```bash
   # Verify Google Maps installed
   npm list @react-google-maps/api
   ```

4. **Read full guide:**
   - Open `GOOGLE_MAPS_MIGRATION_GUIDE.md`
   - Search for your issue
   - Follow the solution

5. **Last resort:**
   ```bash
   # Complete reset
   git clean -fd
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run dev
   ```

---

**Date Started:** August 18, 2026  
**Status:** Ready for setup  
**Estimated Time:** 5-15 minutes  

🎉 **Good luck! You've got this!**
