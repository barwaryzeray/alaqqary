export type PropertyType = 
  | "Apartment" 
  | "House" 
  | "Villa" 
  | "Land" 
  | "Commercial" 
  | "Office";

export type PropertyStatus = "pending" | "approved" | "rejected";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  area: number; // in square meters
  bedrooms?: number;
  bathrooms?: number;
  district?: string; // kept for backward compatibility
  address?: string; // kept for backward compatibility
  location: {
    district: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  seller: {
    name: string;
    phone: string;
    whatsapp: string;
    email?: string;
  };
  createdAt: Date;
  featured?: boolean;
  status: PropertyStatus;
  rejectionReason?: string;
  submittedBy?: string; // userId of the submitter
}

export interface PropertyFilters {
  type?: PropertyType | "All";
  minPrice?: number;
  maxPrice?: number;
  searchLocation?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  name: string;
  phone?: string;
  createdAt: Date;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: "admin" | "user";
  name: string;
  isLoggedIn: boolean;
  expiresAt: number;
}
