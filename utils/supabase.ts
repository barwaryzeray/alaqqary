import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('=============================================================');
  console.error('❌ SUPABASE NOT CONFIGURED');
  console.error('=============================================================');
  console.error('Your app is configured to use Supabase only (no localStorage).');
  console.error('Please set up your Supabase database and add the following to');
  console.error('your .env.local file:');
  console.error('');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.error('');
  console.error('See SUPABASE_SETUP.md for complete setup instructions.');
  console.error('=============================================================');
  
  // Throw error to prevent app from running without database
  throw new Error(
    'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See SUPABASE_SETUP.md for instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DatabaseProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: 'apartment' | 'villa' | 'land' | 'commercial';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  seller_name: string;
  seller_phone: string;
  seller_email?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNotification {
  id: string;
  type: string;
  message: string;
  property_id?: string;
  read: boolean;
  created_at: string;
}
