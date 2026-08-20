# Vercel Deployment - Quick Action Checklist

## ✅ Pre-Deployment Verification

- [x] `.env.local` is in `.gitignore` ✅ (verified)
- [x] Environment variables are NOT committed to GitHub ✅ (verified)
- [x] `.gitignore` contains `.env*.local` ✅ (verified)
- [x] Code is pushed to GitHub branch `main` ⚠️ (verify by pushing latest changes)

---

## 🚀 Step 1: Push Latest Code to GitHub

Run these commands in your project folder:

```powershell
# Check git status
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Fix: Update for Vercel deployment with proper types"

# Push to GitHub (your main branch)
git push origin main
```

**Expected**: No errors, all files pushed.

---

## 🌐 Step 2: Configure Environment Variables on Vercel

### 2a: Log into Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your project: **alaqqary**

### 2b: Add Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in the left sidebar
3. For EACH variable below, click **Add New** and enter:

#### Variable 1: Supabase URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://fpuvdhjdqzeuabhqaivm.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```
Click **Save**

#### Variable 2: Supabase Anon Key
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_JM2f7i5ETbRAf8HX7xjz4Q_o4q0uO_u
Environments: ✓ Production ✓ Preview ✓ Development
```
Click **Save**

#### Variable 3: Google Maps API Key
```
Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyAWI4nOedfvTmWtHcqEpPeYNMzGHcQZcOU
Environments: ✓ Production ✓ Preview ✓ Development
```
Click **Save**

**Result**: All three variables should appear in the list below.

---

## 🔄 Step 3: Redeploy Project

1. Click **Deployments** tab at top
2. Find your latest deployment (should show "Failed" or "Ready" status)
3. Click the three dots menu (**...**) on the right
4. Select **Redeploy**
5. A dialog appears → Click **Redeploy**

**Wait**: Build will start. You'll see:
- "Building..." for 1-2 minutes
- "Verifying..." for 30 seconds
- "Ready" (success) or "Failed" (error)

---

## ✅ Step 4: Verify Build Success

### 4a: Check Build Logs
1. Still on **Deployments** tab
2. Click on your deployment (at the top)
3. Scroll down to **Build Logs**
4. Look for:
   - ✅ "Compiled successfully" 
   - ✅ "Build completed"
   - ❌ Any red error messages

### 4b: Test Live Site
1. At the top of the deployment page, click the **Visit** button
2. Or manually visit: https://alaqqary.vercel.app

**Test these features:**
- [ ] Page loads without errors
- [ ] Map displays
- [ ] No console errors (press F12 → Console)
- [ ] Can register
- [ ] Can login
- [ ] Can add a property
- [ ] Admin dashboard works

---

## 🆘 Troubleshooting

### Build Still Failing?

1. **Check exact error:**
   - Go to Deployments → Your deployment → Scroll to Build Logs
   - Find the red error text at the bottom
   - Copy it

2. **Common errors & fixes:**

| Error | Fix |
|-------|-----|
| `Cannot find module '@/...'` | Check file path is correct, file exists |
| `Type 'string' is not assignable to type 'PropertyType'` | Already fixed in `AdminDashboard.tsx` |
| `React Hook missing dependency` | Add to dependency array or add `// eslint-disable-next-line` |
| `ENOENT: no such file or directory` | File doesn't exist or path is wrong |
| `Cannot read properties of undefined` | Check for null/undefined before using |

3. **Test locally first:**
   ```powershell
   npm run build
   npm run lint
   ```

### Build Success but Site Doesn't Work?

1. **Check browser console (F12 → Console):**
   - Look for red error messages
   - Check if Supabase connection works
   - Check if Google Maps loads

2. **Verify API keys are valid:**
   - Test Supabase key: Try login
   - Test Google Maps: Check if map appears

3. **Check environment variable format:**
   - Should NOT have quotes in Vercel dashboard
   - Names are CASE-SENSITIVE
   - Must include `NEXT_PUBLIC_` prefix

---

## 📋 Final Checklist

Before considering deployment complete:

- [ ] Environment variables set on Vercel (all 3)
- [ ] Build shows "Ready" status (green checkmark)
- [ ] Site loads without 404 errors
- [ ] Console has no red errors (some yellow warnings ok)
- [ ] Map displays on home page
- [ ] Can register and login
- [ ] Admin can access dashboard

---

## 🎯 Your Live URLs

- **Main Site**: https://alaqqary.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard (project: alaqqary)
- **Supabase Project**: https://supabase.com/dashboard (your project)

---

## ⏱️ Timeline

- **Step 1** (Push code): 2 minutes
- **Step 2** (Environment vars): 5 minutes
- **Step 3** (Redeploy): 2-3 minutes (build time)
- **Step 4** (Verify): 5 minutes

**Total**: ~15 minutes for complete deployment

---

## 💡 Pro Tips

1. **Watch build logs in real-time**: Click on deployment while it's building to see live logs
2. **Rollback if needed**: Each deployment is saved; you can rollback to previous versions
3. **Monitor performance**: Vercel dashboard shows performance metrics
4. **Check edge function logs**: Some errors only appear in runtime logs, not build logs

---

## 🚀 After Deployment

- Share your live URL: https://alaqqary.vercel.app
- Monitor performance in Vercel dashboard
- Set up notifications for deployment failures (optional)
- Consider adding a custom domain later if needed

