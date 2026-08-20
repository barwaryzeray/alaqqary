# Quick Setup for Google Maps Integration

## ⚡ Quick Start (5 minutes)

### 1. Get Your Google Maps API Key

Visit: https://console.cloud.google.com/apis/dashboard

**Steps:**
1. Click "Create Project"
2. Name it "Duhok Real Estate"
3. Go to APIs & Services → Library
4. Search and enable "Maps JavaScript API"
5. Go to Credentials → Create API Key
6. Copy your new API key

### 2. Add API Key to Your Project

**Option A: Using VS Code**
1. Open `.env.local` in the workspace
2. Add this line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Save the file

**Option B: Using Command Line (PowerShell)**
```powershell
# Run this in your project directory
Add-Content -Path .env.local -Value "`nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE"
```

### 3. Clean and Reinstall Dependencies

**Option A: Using VS Code Terminal**
1. Open Terminal (Ctrl + `)
2. Run these commands:
   ```bash
   npm install
   npm run dev
   ```

**Option B: Manual Clean Install**
```powershell
# Remove old node_modules
Remove-Item -Recurse -Force node_modules

# Install fresh dependencies
npm install

# Start development server
npm run dev
```

### 4. Test the Map

- Open http://localhost:3000 in your browser
- You should see an interactive Google Map
- Try clicking on property markers
- Try the location picker when adding a property

## ✅ Verification Checklist

- [ ] Google Maps API Key obtained
- [ ] API Key added to `.env.local`
- [ ] `npm install` completed successfully
- [ ] `npm run dev` running without errors
- [ ] Map loads on main page
- [ ] Property markers visible
- [ ] Clicking markers shows property details
- [ ] Location picker works in property form

## 🆘 If Something Goes Wrong

### Error: "Google Maps API key not configured"

**Solution:** Check your `.env.local` file
```bash
# Check if the file exists and contains the key
Get-Content .env.local | Select-String "GOOGLE_MAPS"
```

If nothing shows, add the key:
```powershell
Add-Content -Path .env.local -Value "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE"
```

Then restart the dev server:
```bash
# Press Ctrl+C to stop the server
# Run again
npm run dev
```

### Error: "Maps JavaScript API is not available"

**Solution:** Your API key doesn't have the Maps JavaScript API enabled
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Maps JavaScript API"
3. Click it and press "ENABLE"
4. Wait 1-2 minutes for the change to propagate
5. Restart your dev server

### Error: "API key restrictions"

**Solution:** For local development, unrestrict the API key
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under "Application restrictions", select "None"
4. Under "API restrictions", select "Maps JavaScript API"
5. Save and wait 2 minutes

## 📚 Next Steps

- Read full guide: `GOOGLE_MAPS_MIGRATION_GUIDE.md`
- Review changes: See commits in git history
- Deploy to production: See `DEPLOYMENT.md`

## 🔐 Security Notes

- Never commit `.env.local` with real API keys
- Use different API keys for development and production
- Monitor usage in Google Cloud Console to prevent unexpected charges
- Set up billing alerts on your Google Cloud project

---

**Need help?** Check `GOOGLE_MAPS_MIGRATION_GUIDE.md` for detailed troubleshooting.
