"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Property, PropertyFilters } from "@/types/property";

interface AppContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  showPropertyDetails: boolean;
  setShowPropertyDetails: (show: boolean) => void;
  showAddProperty: boolean;
  setShowAddProperty: (show: boolean) => void;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({
    type: "All",
    minPrice: undefined,
    maxPrice: undefined,
    searchLocation: "",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
        showPropertyDetails,
        setShowPropertyDetails,
        showAddProperty,
        setShowAddProperty,
        filters,
        setFilters,
        darkMode,
        setDarkMode,
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
