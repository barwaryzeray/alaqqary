# Duhok Real Estate - Modern Map-First Property Platform

A modern, premium real estate web application focused exclusively on Duhok Governorate, Iraq. Built with Next.js, TypeScript, and React Leaflet.

## Features

✨ **Map-First Interface** - Full-screen interactive map centered on Duhok, no traditional homepage
🗺️ **Custom Property Markers** - Animated markers with automatic clustering when zoomed out
🏠 **Property Listings** - 10+ sample properties across Duhok districts
💫 **Smooth Animations** - Subtle transitions and modern UI interactions
🌓 **Dark Mode** - Toggle between light and dark themes
📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
🔍 **Smart Filters** - Search by location, property type, and price range
➕ **Easy Property Addition** - 3-step process with map-based location selection
📞 **Contact Sellers** - Direct phone and WhatsApp integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet + Leaflet
- **Icons**: Lucide React
- **Clustering**: React Leaflet Cluster

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will open directly to the full-screen map centered on Duhok Governorate.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page (map-first)
│   └── globals.css         # Global styles
├── components/
│   ├── Map.tsx             # Main map component
│   ├── Navigation.tsx      # Top navigation bar
│   ├── PropertyPreviewCard.tsx  # Popup preview card
│   ├── PropertyDetails.tsx      # Side panel details
│   └── AddPropertyModal.tsx     # Add property modal
├── context/
│   └── AppContext.tsx      # Global state management
├── data/
│   └── properties.ts       # Sample property data
├── types/
│   └── property.ts         # TypeScript types
└── utils/
    └── filters.ts          # Filter utilities

```

## Usage

### Browsing Properties

- The map loads immediately with all properties visible as markers
- Click any marker to see a property preview card
- Click "View Details" for full property information
- Use the top navigation to filter by location, type, or price

### Adding a Property

1. Click the "Add Property" button in the navigation
2. **Step 1**: Upload property photos
3. **Step 2**: Enter property details (price, type, area, etc.)
4. **Step 3**: Click on the map to set the exact location
5. Click "Publish Listing" to submit

### Filters

- **Search by Location**: Type district name or address
- **Property Type**: Filter by Apartment, House, Villa, Land, Commercial, or Office
- **Price Range**: Set minimum and maximum price

### Dark Mode

Click the moon/sun icon in the navigation to toggle between light and dark themes.

## Sample Data

The application includes 10 sample properties across Duhok districts:

- Duhok Center
- Zakho
- Sumel / Semel
- Amadiya
- Zawita
- Bardarash

## Customization

### Adding Real Data

Replace the sample data in `data/properties.ts` with your actual property listings:

```typescript
export const sampleProperties: Property[] = [
  // Your properties here
];
```

### Changing Map Center

Update the center coordinates in `data/properties.ts`:

```typescript
export const DUHOK_CENTER = {
  lat: 36.8630,
  lng: 42.9910,
};
```

### Styling

- Colors are defined in `tailwind.config.ts`
- Custom animations are in `app/globals.css`
- Component-specific styles use Tailwind classes

## Building for Production

```bash
npm run build
npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- Map tiles from OpenStreetMap
- Icons from Lucide React
- Sample images from Unsplash

---

Built with ❤️ for Duhok Governorate
## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up Supabase (REQUIRED for data storage):

The application uses Supabase as its database. You must configure it before running:

- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete database setup instructions
- Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will open directly to the full-screen map centered on Duhok Governorate.

## Data Storage

**Online Database (Supabase)** - All user accounts, property listings, and notifications are stored in a Supabase PostgreSQL database. This enables:

- ✅ Data shared across all users
- ✅ Persistent storage
- ✅ Works in production
- ✅ Admin approval workflow
- ✅ Notifications system
- ✅ 500MB free tier

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup instructions.

## Deployment

The app is ready for deployment on Vercel:

- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions
- Environment variables must be configured in Vercel dashboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet + Leaflet
- **Icons**: Lucide React
- **Clustering**: React Leaflet Cluster
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Free Tier Limits

- Supabase: 500MB database, 2GB bandwidth, 50,000 monthly active users
- Vercel: Unlimited static sites, 100GB bandwidth/month

## Support

- Database Setup: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
