# 🔧 Troubleshooting Guide

Common issues and their solutions for the Duhok Real Estate application.

---

## 📦 Installation Issues

### ❌ "npm: command not found"

**Problem:** Node.js is not installed or not in PATH

**Solution:**
1. Download Node.js from https://nodejs.org (LTS version)
2. Run the installer
3. Restart your terminal/command prompt
4. Verify: `node --version` and `npm --version`

---

### ❌ "EACCES: permission denied"

**Problem:** Permission issues on Linux/Mac

**Solution:**
```bash
# Option 1: Use npx instead
npx create-next-app@latest

# Option 2: Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
```

---

### ❌ "Cannot find module"

**Problem:** Dependencies not installed

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🚀 Development Server Issues

### ❌ "Port 3000 already in use"

**Problem:** Another application is using port 3000

**Solution:**

**Option 1:** Use a different port
```bash
npm run dev -- -p 3001
```

**Option 2:** Kill the process using port 3000

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

---

### ❌ "Error: ENOSPC"

**Problem:** File watcher limit reached (Linux)

**Solution:**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### ❌ Server starts but page doesn't load

**Problem:** Firewall or network issue

**Solution:**
1. Check firewall settings
2. Try: `http://localhost:3000` instead of `http://127.0.0.1:3000`
3. Restart browser
4. Clear browser cache

---

## 🗺️ Map Issues

### ❌ Map not displaying (blank/gray screen)

**Problem:** Leaflet CSS not loaded or SSR issue

**Solutions:**

1. **Check Leaflet CSS import** in `components/Map.tsx`:
```typescript
import "leaflet/dist/leaflet.css";
```

2. **Verify dynamic import** in `app/page.tsx`:
```typescript
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});
```

3. **Check browser console** for errors (F12)

4. **Verify internet connection** (map tiles load from internet)

---

### ❌ Map markers not showing

**Problem:** Icon path or marker data issue

**Solution:**

1. **Check marker icon fix** in `components/Map.tsx`:
```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/...",
  iconUrl: "https://cdnjs.cloudflare.com/...",
  shadowUrl: "https://cdnjs.cloudflare.com/...",
});
```

2. **Verify property data** has valid coordinates

3. **Check console** for JavaScript errors

---

### ❌ Marker clusters not working

**Problem:** react-leaflet-cluster not installed correctly

**Solution:**
```bash
npm uninstall react-leaflet-cluster
npm install react-leaflet-cluster@latest
npm run dev
```

---

### ❌ Map tiles not loading

**Problem:** OpenStreetMap server issues or network

**Solution:**

1. **Check internet connection**

2. **Try different tile provider** in `components/Map.tsx`:
```typescript
// Replace OpenStreetMap with Mapbox or other provider
<TileLayer
  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
  attribution='&copy; OpenStreetMap contributors'
/>
```

3. **Check if OpenStreetMap is down**: https://www.openstreetmap.org

---

## 🎨 Styling Issues

### ❌ Tailwind classes not working

**Problem:** Tailwind not configured properly

**Solution:**

1. **Verify tailwind.config.ts** includes all content paths:
```typescript
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

2. **Check globals.css** has Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **Rebuild**:
```bash
rm -rf .next
npm run dev
```

---

### ❌ Dark mode not working

**Problem:** Class not applied to HTML element

**Solution:**

Check `components/Navigation.tsx` toggleDarkMode function:
```typescript
if (!darkMode) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
```

Also verify `tailwind.config.ts` has:
```typescript
darkMode: "class",
```

---

### ❌ Fonts not loading

**Problem:** Google Fonts import issue

**Solution:**

Verify in `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

Or use Next.js Font optimization in `app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

---

## 🖼️ Image Issues

### ❌ Images not loading

**Problem:** Next.js Image domain not configured

**Solution:**

Add image domains to `next.config.mjs`:
```javascript
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'your-domain.com'
    ],
  },
};
```

---

### ❌ "Invalid src prop"

**Problem:** Image URL format incorrect

**Solution:**
- Use absolute URLs: `https://example.com/image.jpg`
- Or use Next.js public folder: `/images/photo.jpg`

---

## 📱 Mobile Issues

### ❌ Map not responsive on mobile

**Problem:** Viewport meta tag missing

**Solution:**

Verify in `app/layout.tsx`:
```typescript
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
```

---

### ❌ Touch events not working

**Problem:** Browser compatibility

**Solution:**

Test in different mobile browsers. Some features may need:
```typescript
// Add touch event listeners
element.addEventListener('touchstart', handler);
```

---

## 🔨 Build Issues

### ❌ "Type error" during build

**Problem:** TypeScript errors

**Solution:**

1. **Check types** in files mentioned in error
2. **Run type check**:
```bash
npx tsc --noEmit
```

3. **Common fixes**:
```typescript
// Add type assertions
const element = document.getElementById('id') as HTMLElement;

// Use optional chaining
property?.value

// Add proper types to functions
const handler = (e: React.MouseEvent) => {}
```

---

### ❌ Build succeeds but app crashes

**Problem:** Runtime error not caught during build

**Solution:**

1. **Check browser console** for errors
2. **Test production build locally**:
```bash
npm run build
npm start
```

3. **Look for**:
   - Missing environment variables
   - Incorrect imports
   - Browser-only code running on server

---

## 🌐 Browser Issues

### ❌ Features not working in Safari

**Problem:** Browser compatibility

**Solution:**

Add polyfills or check for Safari-specific issues:
```typescript
// Check for feature support
if ('IntersectionObserver' in window) {
  // Use feature
}
```

---

### ❌ Console warnings

**Problem:** React hydration warnings

**Solution:**

1. **"Warning: useLayoutEffect does nothing on the server"**
   - Ignore or use dynamic import with ssr: false

2. **"Warning: Each child in a list should have a unique key"**
   - Add unique key prop to list items:
```typescript
{items.map((item) => <div key={item.id}>{item.name}</div>)}
```

---

## 🔄 State Management Issues

### ❌ "useApp must be used within an AppProvider"

**Problem:** Component used outside provider

**Solution:**

Ensure `AppProvider` wraps all components in `app/page.tsx`:
```typescript
<AppProvider>
  <Navigation />
  <Map />
  // etc...
</AppProvider>
```

---

### ❌ Filters not updating map

**Problem:** State not propagating correctly

**Solution:**

1. Check filter changes trigger state update
2. Verify `useMemo` dependencies in `app/page.tsx`:
```typescript
const filteredProperties = useMemo(() => {
  return filterProperties(sampleProperties, filters);
}, [filters]); // Add filters as dependency
```

---

## 🚨 Performance Issues

### ❌ Map is slow/laggy

**Problem:** Too many markers or large images

**Solutions:**

1. **Enable clustering** (already implemented)

2. **Optimize images**:
```typescript
<Image
  src={src}
  quality={75}
  loading="lazy"
/>
```

3. **Reduce marker count** for testing:
```typescript
// In data/properties.ts
export const sampleProperties: Property[] = properties.slice(0, 20);
```

---

### ❌ Page loads slowly

**Problem:** Bundle size or API calls

**Solutions:**

1. **Analyze bundle**:
```bash
npm run build
# Check .next/analyze folder
```

2. **Use dynamic imports**:
```typescript
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>
});
```

3. **Optimize images and assets**

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Add to `next.config.mjs`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

### Check React DevTools

1. Install React DevTools extension
2. Inspect component tree
3. Check props and state

### Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Check for failed requests
4. Verify tile and image loading

### Console Logging

Add temporary logs:
```typescript
console.log('Map rendered:', properties.length);
console.log('Filters:', filters);
```

Remember to remove before production!

---

## 📞 Still Having Issues?

### Quick Fixes to Try:

1. **Clear cache and rebuild**:
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

2. **Check versions**:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

3. **Update all dependencies**:
```bash
npm update
```

4. **Try different browser** (Chrome, Firefox, Safari)

5. **Disable browser extensions** temporarily

6. **Check firewall/antivirus** settings

### Get Help:

1. Check GitHub Issues (if applicable)
2. Review Next.js documentation
3. Check React Leaflet docs
4. Search Stack Overflow
5. Review error messages carefully

---

## 🎓 Common Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| `ECONNREFUSED` | Can't connect to server | Check if dev server is running |
| `ERR_MODULE_NOT_FOUND` | Missing dependency | Run `npm install` |
| `Hydration failed` | Client/server mismatch | Use dynamic import with ssr: false |
| `Maximum update depth` | Infinite re-render | Check useEffect dependencies |
| `Objects are not valid as React child` | Rendering object instead of string | Convert to string or use correct property |

---

**Most issues can be solved by:**
1. Reading error messages carefully
2. Checking browser console (F12)
3. Clearing cache and rebuilding
4. Verifying internet connection
5. Updating dependencies

**Good luck! 🍀**
