import { createClient } from '@supabase/supabase-js';
import { ENV } from './config';

const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
