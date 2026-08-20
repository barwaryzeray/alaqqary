# Deployment Guide

## 🚀 Deploy Your Duhok Real Estate Application

This guide covers deploying your application to popular hosting platforms.

---

## ☁️ Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications. It's created by the same team that built Next.js!

### Steps:

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Duhok Real Estate"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

3. **Deploy via Vercel Website**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub account
   - Select your repository
   - Click "Deploy"

4. **Or deploy via CLI**:
```bash
vercel
```

### Configuration:

Vercel auto-detects Next.js projects. No configuration needed!

Your app will be live at: `your-app-name.vercel.app`

### Custom Domain:

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `duhok-realestate.com`)
4. Update your DNS records as instructed

---

## 🌐 Netlify

Another excellent option with easy deployment.

### Steps:

1. **Build the project**:
```bash
npm run build
```

2. **Push to GitHub** (same as above)

3. **Deploy via Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy"

---

## 🐳 Docker

Deploy using Docker for more control.

### Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Create `.dockerignore`:

```
node_modules
.next
.git
*.md
```

### Build and run:

```bash
docker build -t duhok-realestate .
docker run -p 3000:3000 duhok-realestate
```

---

## 🔧 VPS Deployment (DigitalOcean, AWS EC2, etc.)

### Prerequisites:

- Ubuntu 20.04+ server
- Domain pointed to server IP
- SSH access

### Steps:

1. **Connect to your server**:
```bash
ssh root@your-server-ip
```

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2** (process manager):
```bash
sudo npm install -g pm2
```

4. **Clone your repository**:
```bash
git clone YOUR_REPO_URL
cd map
```

5. **Install dependencies**:
```bash
npm install
```

6. **Build the project**:
```bash
npm run build
```

7. **Start with PM2**:
```bash
pm2 start npm --name "duhok-realestate" -- start
pm2 save
pm2 startup
```

8. **Setup Nginx** (reverse proxy):

Install Nginx:
```bash
sudo apt install nginx
```

Create config file:
```bash
sudo nano /etc/nginx/sites-available/duhok-realestate
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/duhok-realestate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🔐 Environment Variables

For production, you may need to set environment variables.

### Create `.env.local` (development):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MAP_CENTER_LAT=36.8630
NEXT_PUBLIC_MAP_CENTER_LNG=42.9910
```

### On Vercel:

1. Go to project settings
2. Click "Environment Variables"
3. Add each variable

### On VPS:

Create `.env.production`:
```bash
nano .env.production
```

Add your variables, then:
```bash
pm2 restart duhok-realestate --update-env
```

---

## 📊 Performance Optimization

### Before Deployment:

1. **Optimize images**: Use WebP format
2. **Enable caching**: Configure in `next.config.mjs`
3. **Compress assets**: Enable gzip in Nginx
4. **CDN setup**: Use Vercel's CDN or Cloudflare

### Next.js Config for Production:

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'your-cdn.com'],
    formats: ['image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
```

---

## 🔄 CI/CD Setup

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📱 Mobile App (PWA)

Convert to Progressive Web App for mobile installation.

### Add to `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Duhok Real Estate",
  description: "Find your dream property in Duhok",
  manifest: "/manifest.json",
  themeColor: "#2563EB",
};
```

### Create `public/manifest.json`:

```json
{
  "name": "Duhok Real Estate",
  "short_name": "Duhok RE",
  "description": "Find properties in Duhok Governorate",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test in production mode locally
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Verify all links work
- [ ] Test image loading
- [ ] Check map functionality
- [ ] Test form submissions
- [ ] Verify SEO meta tags
- [ ] Test on different browsers
- [ ] Check console for errors
- [ ] Optimize images
- [ ] Setup analytics (Google Analytics, etc.)
- [ ] Configure error monitoring (Sentry, etc.)

---

## 📈 Post-Deployment

### Monitoring:

1. **Vercel Analytics**: Built-in for Vercel deployments
2. **Google Analytics**: Add tracking code
3. **Error tracking**: Setup Sentry or similar

### SEO:

1. Submit sitemap to Google Search Console
2. Verify site ownership
3. Add structured data for properties
4. Create `robots.txt`

### Security:

1. Enable HTTPS (auto on Vercel)
2. Setup CSP headers
3. Add rate limiting for API routes
4. Regular security updates

---

## 🆘 Troubleshooting

### Build Fails:

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Map Not Loading:

- Check internet connection
- Verify Leaflet CSS is imported
- Check browser console for errors

### Images Not Showing:

- Verify image domains in `next.config.mjs`
- Check image URLs are correct
- Ensure HTTPS on production

---

## 💡 Tips

1. **Start with Vercel**: It's the easiest
2. **Use Git**: Always version control
3. **Test locally**: Build and test before deploying
4. **Monitor performance**: Use Lighthouse scores
5. **Backup data**: Regular database backups if using API

---

**Your Duhok Real Estate app is ready to go live! 🚀**
