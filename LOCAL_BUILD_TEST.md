# Local Build Testing - Before Vercel Deployment

## Overview

This guide helps you test the build locally before pushing to Vercel. This catches issues early.

---

## Prerequisites

Make sure you have:
- Node.js installed (v18 or newer)
- npm or yarn
- All dependencies installed (`npm install`)
- `.env.local` file with your variables

---

## Test Commands

### 1. Clean Install (Recommended First Step)

```powershell
# Remove node_modules and cache
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Fresh install
npm install
```

**Expected**: `up to date` message at the end with no errors.

---

### 2. Check TypeScript

```powershell
# Check for TypeScript errors without building
npx tsc --noEmit
```

**Expected Output**:
- ✅ No output = No errors (good!)
- ❌ If you see errors, fix them before building

**Common Errors & Fixes**:
```
Error: Type 'string' is not assignable to type 'PropertyType'
→ Fix: Add `as PropertyType` to the assignment (already done in AdminDashboard.tsx)

Error: Cannot find name 'X'
→ Fix: Check imports, verify the type/variable is exported

Error: React Hook useEffect has missing dependency
→ Fix: Add the dependency to the dependency array
```

---

### 3. Run ESLint

```powershell
# Check for linting issues
npm run lint
```

**Expected Output**:
```
✓ No errors or warnings
```

**If you see warnings**:
- Some warnings can be ignored (like unused variables you'll use later)
- To ignore a line: Add `// eslint-disable-next-line`
- Build will NOT fail because of warnings, only errors

---

### 4. Full Build Test

```powershell
# This is what Vercel runs
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
info  - Collecting page data
(build completes successfully)
```

**If build fails**:
- Scroll up in the terminal to find the error
- Error will be clearly marked with a red X and line number
- Common issues:
  - TypeScript type errors
  - Import/module not found
  - Syntax errors
  - Missing dependencies

---

### 5. Test the Built App Locally

```powershell
# Start the production build locally
npm run start
```

**Expected**: 
- App starts on `http://localhost:3000`
- No console errors

**Then visit**:
- http://localhost:3000
- Test: Map loads, can interact with the site

**Stop the server**: Press Ctrl+C

---

## Diagnostic Tests

### Test 1: Verify Environment Variables

Create a test file temporarily:

**File: `test-env.js`**
```javascript
console.log("Environment Variables Check:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "***");
console.log("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 10) + "***");
```

Run it:
```powershell
node test-env.js
```

**Expected**: All three should show values (not undefined)

Then delete:
```powershell
Remove-Item test-env.js
```

---

### Test 2: Check File Imports

```powershell
# Look for common import issues
Select-String -Path "**/*.tsx", "**/*.ts" -Pattern "from.*@/" -Recurse
```

Make sure all paths exist:
- `@/components/...` should map to `./components/...`
- `@/utils/...` should map to `./utils/...`
- `@/types/...` should map to `./types/...`

---

### Test 3: Check for Circular Dependencies

```powershell
# Look for imports that might cause circular dependencies
# This is more advanced, but check if:
# - utils imports from components
# - components import from utils
# - and there's a cycle

# Example (likely ok):
# utils/propertyStorage.ts → imports from types ✓
# components/Map.tsx → imports from utils ✓
# (no cycle)
```

---

## Pre-Deployment Checklist

Before pushing to GitHub and Vercel:

- [ ] `npm run build` completes successfully (shows "✓ Compiled successfully")
- [ ] `npm run lint` shows no errors (warnings ok)
- [ ] `npm run start` starts the app without errors
- [ ] Opening http://localhost:3000 works
- [ ] Map displays
- [ ] No red errors in browser console (F12 → Console tab)
- [ ] Can register, login, and use the app

---

## Debug Mode: Verbose Output

If you need more detailed output:

```powershell
# Build with verbose logging
$env:DEBUG = 'next:*'
npm run build

# Reset debug
$env:DEBUG = ''
```

---

## If All Tests Pass Locally

You're ready to:

1. ✅ Push to GitHub
2. ✅ Configure environment variables on Vercel
3. ✅ Redeploy on Vercel

---

## If Tests Fail Locally

### TypeScript Errors

**Example**:
```
Type 'string' is not assignable to type 'PropertyType'
```

**Fix**: 
1. Open the file and line number shown
2. Add type casting: `as PropertyType`
3. Re-run `npx tsc --noEmit`

### Module Not Found

**Example**:
```
Cannot find module '@/utils/propertyStorage'
```

**Fix**:
1. Check the file exists at `./utils/propertyStorage.ts`
2. Check the import path is correct
3. Verify tsconfig.json has the `@/*` path alias

### Missing Dependencies

**Example**:
```
Module not found: 'supabase-js'
```

**Fix**:
```powershell
npm install supabase-js
```

---

## Common Build Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build takes too long | Press Ctrl+C, then try `npm run build` again fresh |
| `ERR! code ENOENT` | File doesn't exist. Check file paths. |
| `.next` folder is huge | Normal. Make sure it's in `.gitignore`. |
| Build succeeds but `npm start` fails | Try removing `.next` and rebuilding |
| Different results locally vs Vercel | Usually environment variables. Verify all 3 are set on Vercel |

---

## Vercel Supports These Node Versions

- Node 16.x (older)
- Node 18.x (recommended)
- Node 20.x (latest)

Your project uses: **Next.js 14.2.0** (compatible with all)

To check your local Node version:
```powershell
node --version
```

If it's Node 14 or older, consider upgrading.

---

## Final Checklist Before Submitting

```
✅ TypeScript check passes
✅ Lint check passes (no errors)
✅ Build completes successfully
✅ Production server starts
✅ Website loads and works
✅ No console errors
✅ Environment variables are set
✅ Code pushed to GitHub
✅ Environment variables set on Vercel
✅ Vercel build succeeds
✅ Live site works
```

