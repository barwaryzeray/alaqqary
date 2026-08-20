# Vercel Deployment Troubleshooting Guide

## Quick Diagnosis Flowchart

```
Build Failed on Vercel?
│
├─ Yes → Check Vercel Build Logs
│        Look for RED ERROR at bottom
│        Go to section: "Build Errors"
│
├─ Build Succeeded but Site Doesn't Work?
│  │
│  ├─ 404 Not Found → Deployment page issue
│  │
│  ├─ Blank page → React/Next.js error
│  │  → Open browser console (F12)
│  │  → Look for red errors
│  │
│  └─ Partial functionality → Missing environment variable
│     → Verify all 3 env vars on Vercel
│
└─ Works Locally but Fails on Vercel?
   → Environment variables not set on Vercel
   → Or different Node version
   → Or cached build issue
```

---

## Section 1: Build Errors (Most Common)

### Error: Type 'string' is not assignable to type 'PropertyType'

**Location**: AdminDashboard.tsx line 643

**Status**: ✅ ALREADY FIXED in your project

**What was done**:
- Added `PropertyType` import
- Cast value: `e.target.value as PropertyType`

**If you still see this error**:
- Clear Vercel cache: Deployments → Three dots → Clear Cache → Redeploy
- Or check AdminDashboard.tsx line 643 is updated

---

### Error: Cannot find module '@/...'

**Example**:
```
Cannot find module '@/types/property'
```

**Cause**: Import path doesn't exist or is wrong

**Fix**:
1. Check the file exists: `./types/property.ts`
2. Check the tsconfig.json has:
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```
3. Verify case sensitivity (Linux is case-sensitive on Vercel)

---

### Error: Module not found 'package-name'

**Example**:
```
Cannot find module 'lucide-react'
```

**Cause**: Dependency not listed in package.json or not installed

**Fix**:
1. Check package.json includes the dependency
2. Run locally: `npm install` (to verify it installs)
3. Push updated package.json to GitHub
4. Redeploy on Vercel

---

### Error: React Hook X has missing dependency

**Example**:
```
React Hook useEffect has a missing dependency: 'refresh'
```

**Cause**: Function used in hook but not in dependency array

**Fix Option 1** (Recommended):
Add to dependency array:
```typescript
useEffect(() => {
  refresh();
}, [refresh]); // Add 'refresh' here
```

**Fix Option 2** (Quick):
Suppress warning:
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  refresh();
}, []);
```

---

### Error: Unexpected token or Syntax Error

**Example**:
```
Unexpected token } in JSON
SyntaxError: Unexpected token
```

**Cause**: Typo or malformed code

**Fix**:
1. Check the line number in error
2. Look for: Missing semicolon, wrong bracket, etc.
3. Test locally with: `npm run build`

---

## Section 2: Environment Variable Issues

### Problem: Build succeeds but site shows 404

**Cause**: Usually environment variables missing at runtime

**Diagnosis**:
1. Visit your live site
2. Press F12 → Console tab
3. Look for red errors mentioning:
   - "NEXT_PUBLIC_SUPABASE_URL"
   - "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
   - "undefined"

**Fix**:
1. Go to Vercel dashboard → Settings → Environment Variables
2. Verify all THREE variables are present:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Make sure they're assigned to:
   - ✓ Production
   - ✓ Preview
   - ✓ Development
4. If any are missing, add them
5. Redeploy

---

### Problem: Wrong environment variable values

**Cause**: Copy-paste error or expired keys

**Fix**:
1. Get fresh values from:
   - Supabase: https://supabase.com/dashboard → Settings → API
   - Google Cloud: https://console.cloud.google.com → APIs & Services → Credentials
2. Update on Vercel: Settings → Environment Variables
3. Redeploy

---

### Problem: Site works locally but not on Vercel

**Most Common Cause**: Environment variables

**Diagnosis**:
```bash
# Locally, you have .env.local with real values
# But Vercel doesn't have .env.local (it's .gitignored)
# So it uses the Vercel environment variables instead
```

**Fix**:
1. Verify environment variables on Vercel are EXACTLY the same as your `.env.local`
2. Check variable names are spelled correctly
3. Check values have no extra spaces or quotes
4. Redeploy

---

## Section 3: Redeploy & Cache Issues

### Problem: Keep getting same error even after fix

**Cause**: Vercel is using cached build

**Fix**:
1. Go to Vercel Dashboard
2. Deployments tab
3. Find the failed deployment
4. Click three dots menu (...)
5. Select **Clear Cache and Redeploy**

---

### Problem: Want to rollback to previous version

**Steps**:
1. Deployments tab
2. Scroll down to see previous deployments
3. Find the one that was working
4. Click three dots → **Promote to Production**
5. Site instantly goes back to that version

---

## Section 4: Runtime Errors (Site Loads but Breaks)

### Symptom: Blank white page with no error

**Possible Causes**:
1. React/Next.js error
2. Missing environment variable
3. API call failing

**Diagnosis**:
1. Press F12 (open developer tools)
2. Click **Console** tab
3. Look for red error messages
4. Screenshot the error

**Common Runtime Errors**:

**Error**: `Cannot read properties of undefined (reading 'X')`
```
Fix: Check if object exists before accessing property
if (object?.property) { ... }
```

**Error**: `Google Maps API not loaded`
```
Fix: Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set and valid
```

**Error**: `Supabase connection failed`
```
Fix: Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
```

---

## Section 5: Performance & Limits

### Build takes too long

**Vercel free tier limit**: 45 minutes

**Your project typically builds in**: 2-3 minutes

**If it exceeds 45 minutes**:
- You have production issues (unlikely for your size)
- Contact Vercel support

---

### Deployment preview created but build failed

**What this means**:
- Vercel created a preview URL before running `npm run build`
- The build step itself failed
- You can still see the error in build logs

**Fix**:
1. Find the error in build logs
2. Fix it locally
3. Push to GitHub
4. Redeploy (or wait for auto-deploy)

---

## Section 6: Verification Checklist

### Pre-Deployment

- [ ] Local build works: `npm run build` ✓
- [ ] No TypeScript errors: `npx tsc --noEmit` ✓
- [ ] No lint errors: `npm run lint` ✓
- [ ] Code pushed to GitHub `main` branch
- [ ] `.env.local` is NOT in git (check `.gitignore`)

### On Vercel

- [ ] Project created and connected
- [ ] All 3 environment variables added
- [ ] Variables set for all 3 environments
- [ ] Build in progress or completed
- [ ] Build shows "Ready" status

### After Deployment

- [ ] Live URL loads (https://alaqqary.vercel.app)
- [ ] No 404 error
- [ ] Page not blank
- [ ] Console (F12) has no red errors
- [ ] Map displays
- [ ] Can interact with forms
- [ ] Can register/login

---

## Section 7: Emergency Recovery

### Site is broken and you need to restore

**Option 1: Rollback to previous working version**
1. Vercel → Deployments
2. Find last working deployment
3. Click ... → Promote to Production
4. Takes effect immediately

**Option 2: Redeploy from GitHub**
1. Fix the issue in your code
2. Commit and push: `git push origin main`
3. Vercel auto-deploys on push
4. Or manually: Deployments → Redeploy

**Option 3: Clear cache and rebuild**
1. Deployments → Latest (failed)
2. Click ... → Clear Cache and Redeploy
3. Wait for new build

---

## Section 8: Advanced Debugging

### Enable verbose logs

Add to environment variables on Vercel:
```
DEBUG=next:*
```

Then redeploy to see detailed logs.

---

### Check Node version mismatch

```powershell
# Check your local version
node --version

# Vercel uses Node 18.x by default
# If you have Node 14 or older, upgrade locally
```

---

### Check for secrets leaked in logs

⚠️ **IMPORTANT**: Your API keys might be visible in build logs!

**Never commit**:
- `.env.local`
- API keys
- Supabase keys
- Google Maps keys

**Our `.gitignore` already protects these**. Verify with:
```powershell
git status
```

Should NOT show `.env.local` in the list.

---

## Section 9: When to Contact Support

Contact Vercel support if:
- Build exceeds 45 minutes
- Getting 503 Service Unavailable
- Deployment keeps timing out
- Infrastructure issues (not your code)

Contact Supabase support if:
- Database connection times out
- Auth errors on live site
- Performance issues with database queries

Contact Google Cloud if:
- Maps API not working
- API key rate limits exceeded

---

## Quick Reference: Commands

```powershell
# Test locally before pushing
npm run build       # Full build test
npm run lint        # Check for linting issues
npx tsc --noEmit   # Check TypeScript errors
npm run start       # Run production build locally

# Git operations
git status          # See what changed
git add .           # Stage all changes
git commit -m "msg" # Commit changes
git push origin main # Push to GitHub

# Clear local cache if needed
Remove-Item -Recurse .next
npm run build
```

---

## Getting Help

**For this specific project**:
1. Check error message in Vercel build logs
2. Find matching section in this guide
3. Follow the fix
4. Redeploy

**General Vercel Issues**: https://vercel.com/support

**Next.js Issues**: https://nextjs.org/docs

**Supabase Issues**: https://supabase.com/docs

---

## Success Indicators

✅ Vercel shows "Ready" status with green checkmark
✅ Live URL loads without 404
✅ Browser console (F12) has no red errors
✅ Map displays on home page
✅ Can register and login successfully
✅ Admin can access dashboard
✅ Properties display on map

If all ✅, deployment is successful!

