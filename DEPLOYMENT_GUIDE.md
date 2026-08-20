# Deployment Guide - Duhok Real Estate App

This guide will walk you through deploying your Duhok Real Estate application to production using Vercel (free tier) with Supabase database.

## Prerequisites

Before starting, make sure you have:
- ✅ Completed the Supabase setup (see `SUPABASE_SETUP.md`)
- ✅ Your Supabase project URL and anon key
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository

## Step 1: Prepare Your Repository

1. **Create a GitHub repository** (if you haven't already):
   - Go to [github.com](https://github.com) and sign in
   - Click "New repository"
   - Name it `duhok-real-estate` or similar
   - Make it **Public** (required for Vercel free tier)
   - Click "Create repository"

2. **Push your code to GitHub**:
   ```bash
   # Initialize git (if not done already)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial deployment ready"
   
   # Add remote (replace with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/duhok-real-estate.git
   
   # Push to GitHub
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" and choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

2. **Import your project**:
   - Click "New Project" or "Add New..."
   - Find your `duhok-real-estate` repository
   - Click "Import"

3. **Configure the project**:
   - **Project Name**: `duhok-real-estate` (or your preferred name)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-fill)
   - **Output Directory**: `.next` (should auto-fill)
   - **Install Command**: `npm install` (should auto-fill)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

   **⚠️ Important**: Make sure to use the exact variable names with `NEXT_PUBLIC_` prefix

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - You'll see a success screen with your live URL

## Step 3: Test Your Live Website

1. **Visit your live URL** (something like `https://duhok-real-estate-xyz.vercel.app`)

2. **Test key features**:
   - ✅ Map loads properly
   - ✅ Registration works (try creating a test account)
   - ✅ Login works
   - ✅ Adding properties works
   - ✅ Admin dashboard works (login with your admin account from Supabase)
   - ✅ Property approval workflow works

3. **Check both modes**:
   - **Development mode**: When no Supabase env vars → uses localStorage
   - **Production mode**: With Supabase env vars → uses database

## Step 4: Custom Domain (Optional)

If you want a custom domain like `duhokproperties.com`:

1. **Buy a domain** from providers like:
   - Namecheap, GoDaddy, Google Domains, etc.

2. **Add domain in Vercel**:
   - Go to your project dashboard in Vercel
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

3. **Configure DNS**:
   - Add the CNAME record pointing to `cname.vercel-dns.com`
   - Wait 24-48 hours for DNS propagation

## Step 5: Enable HTTPS and Performance

Vercel automatically provides:
- ✅ **HTTPS/SSL certificates** (free)
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Automatic deployments** when you push to GitHub
- ✅ **Preview deployments** for pull requests

## Step 6: Monitor and Maintain

### Analytics
- Go to your Vercel dashboard → Analytics to see traffic
- Supabase dashboard → Database to monitor usage

### Updates
- Simply push to your GitHub repository
- Vercel will automatically redeploy your site
- Zero downtime deployments

### Scaling
**Free tier limits:**
- **Vercel**: 100GB bandwidth/month, unlimited static sites
- **Supabase**: 500MB database, 2GB bandwidth, 50,000 monthly active users

**If you exceed limits:**
- Vercel Pro: $20/month per team member
- Supabase Pro: $25/month per project

## Troubleshooting

### Build Fails
**Error**: `Module not found` or `Cannot resolve`
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add . && git commit -m "Fix dependencies" && git push
```

### Environment Variables Not Working
- Check variable names are exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after adding env vars
- Check Supabase project is not paused

### Supabase Connection Issues
- Verify your Supabase project is active (not paused)
- Check RLS policies are correctly configured
- Ensure your admin user exists in the profiles table

### Performance Issues
- Optimize images by converting to WebP format
- Use Supabase storage for images instead of base64 (future enhancement)
- Enable database indexes for large datasets

### Custom Domain Issues
- DNS propagation can take up to 48 hours
- Use [whatsmydns.net](https://whatsmydns.net) to check DNS status
- Ensure CNAME points to `cname.vercel-dns.com`

## Security Best Practices

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

2. **Monitor Supabase logs** for unusual activity

3. **Use strong admin passwords** in production

4. **Enable Supabase email verification** for user registration

5. **Set up backup strategy** for your database

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

## Production Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Admin account created in Supabase
- [ ] RLS policies tested and working
- [ ] Image upload limits tested
- [ ] Mobile responsiveness verified
- [ ] All major browsers tested
- [ ] Performance tested with realistic data
- [ ] Error handling tested
- [ ] Backup strategy in place

## Cost Summary (Monthly)

**Free tier (good for up to ~10,000 monthly users):**
- Vercel: $0
- Supabase: $0
- Custom domain: ~$10-15/year

**Paid tier (for growth):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month  
- Total: ~$45/month for professional scaling

---

**🎉 Congratulations!** Your Duhok Real Estate app is now live and ready for users!

Your website will be accessible at: `https://your-project-name.vercel.app`

Users can now register, add properties, and admins can approve listings in real-time using the Supabase database.