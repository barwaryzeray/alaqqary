# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

Double-click `install.bat` or run in terminal:

```bash
npm install
```

This will install all required packages (Next.js, React, Leaflet, Tailwind CSS, etc.)

### Step 2: Start the Development Server

Double-click `start.bat` or run in terminal:

```bash
npm run dev
```

### Step 3: Open Your Browser

The application will automatically open at:

**http://localhost:3000**

You'll immediately see a full-screen map of Duhok Governorate with property markers!

---

## 🎯 What You'll See

When you open the application:

1. **Full-screen interactive map** centered on Duhok
2. **Property markers** scattered across different districts
3. **Top navigation bar** with search and filters
4. **Clustered markers** that expand when you zoom in

---

## 🏠 Try These Features

### Browse Properties
- Click any **marker** on the map to see a property preview
- Click **"View Details"** to see full information
- Use **arrow buttons** to browse property photos

### Search & Filter
- Type a **district name** in the search box (e.g., "Zakho", "Duhok Center")
- Select a **property type** from the dropdown
- Click **"Price Range"** to set min/max prices

### Add a Property
1. Click **"Add Property"** button
2. Upload photos (drag & drop or click to browse)
3. Fill in property details
4. Click on the map to set the exact location
5. Click **"Publish Listing"**

### Toggle Dark Mode
- Click the **moon/sun icon** in the navigation
- The entire interface switches theme instantly

### Contact Sellers
- Open any property details
- Click **"Call"** to dial the phone number
- Click **"WhatsApp"** to send a message

---

## 📱 Mobile Friendly

The application is fully responsive. Try resizing your browser or open it on your phone!

---

## 🎨 Color Palette

- **Primary**: #111827 (Dark Gray)
- **Accent**: #2563EB (Blue)
- **Success**: #22C55E (Green)
- **Danger**: #EF4444 (Red)

---

## 📂 Sample Data

The application includes **10 sample properties** across these districts:

- Duhok Center (4 properties)
- Zakho (1 property)
- Sumel/Semel (2 properties)
- Amadiya (1 property)
- Zawita (1 property)
- Bardarash (1 property)

---

## 🛠️ Troubleshooting

### Port Already in Use?

If port 3000 is busy, Next.js will automatically try 3001, 3002, etc.

Or specify a different port:

```bash
npm run dev -- -p 3001
```

### Map Not Loading?

Make sure you have an internet connection. The map tiles are loaded from OpenStreetMap.

### Build for Production?

```bash
npm run build
npm start
```

---

## 🎓 Learn More

Read the full **README.md** for:
- Detailed project structure
- Customization options
- API integration guide
- Deployment instructions

---

## ⚡ Next Steps

1. Replace sample data with real properties in `data/properties.ts`
2. Connect to a backend API for property management
3. Add user authentication
4. Implement favorites and saved searches
5. Add property comparison feature
6. Deploy to production (Vercel, Netlify, etc.)

---

**Enjoy building your real estate platform! 🏡**
