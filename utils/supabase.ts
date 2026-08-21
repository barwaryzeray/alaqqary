import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Warn if Supabase is not configured, but don't throw during build
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase environment variables not set - using placeholder values');
  console.warn('   This is OK during build, but you need to set these variables for runtime:');
  console.warn('   - NEXT_PUBLIC_SUPABASE_URL');
  console.warn('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
);

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
