"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppProvider, useApp } from "@/context/AppContext";
import Navigation from "@/components/Navigation";
import PropertyDetails from "@/components/PropertyDetails";
import AddPropertyModal from "@/components/AddPropertyModal";
import { filterProperties } from "@/utils/filters";
import { loadProperties } from "@/utils/propertyStorage";
import { Property } from "@/types/property";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

function MainContent() {
  const { filters } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);

  const refresh = async () => {
    const props = await loadProperties();
    setProperties(props);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  return (
    <>
      <Navigation onPropertiesUpdate={refresh} />
      <Map properties={filtered} />
      <PropertyDetails onPropertyDeleted={refresh} />
      <AddPropertyModal onPropertyAdded={refresh} />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
