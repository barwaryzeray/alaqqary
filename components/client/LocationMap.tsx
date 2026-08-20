"use client";

import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import { DUHOK_CENTER } from "@/data/properties";

interface LocationMapProps {
  location: { lat: number; lng: number } | null;
  onPick: (loc: { lat: number; lng: number }) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export default function LocationMap({ location, onPick }: LocationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [lat, setLat] = useState<number>(location?.lat ?? DUHOK_CENTER.lat);
  const [lng, setLng] = useState<number>(location?.lng ?? DUHOK_CENTER.lng);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setMounted(true);
    if (location) {
      setLat(location.lat);
      setLng(location.lng);
    }
  }, [location]);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLat = parseFloat(e.target.value);
    if (!isNaN(newLat)) {
      setLat(newLat);
      onPick({ lat: newLat, lng });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLng = parseFloat(e.target.value);
    if (!isNaN(newLng)) {
      setLng(newLng);
      onPick({ lat, lng: newLng });
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setLat(newLat);
      setLng(newLng);
      onPick({ lat: newLat, lng: newLng });
    }
  };

  if (!mounted || !apiKey) {
    return (
      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {!apiKey ? "Google Maps API key not configured" : "Loading map..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 relative">
      <div className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md pointer-events-none">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
          Duhok Region
        </p>
      </div>

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat, lng }}
          zoom={12}
          onLoad={(mapInstance) => setMapRef(mapInstance)}
          onClick={handleMapClick}
          options={{
            fullscreenControl: true,
            mapTypeControl: true,
            zoomControl: true,
            mapTypeId: "hybrid",
          }}
        >
          <MarkerF
            position={{ lat, lng }}
            title="Selected Location"
            icon={{
              path: "M20 0 C12.26 0 6 6.26 6 14 C 6 24 20 50 20 50 C 20 50 34 24 34 14 C 34 6.26 27.74 0 20 0 Z",
              scale: 1,
              fillColor: "#2563EB",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
              anchor: new google.maps.Point(20, 50),
            }}
          />
        </GoogleMap>
      </LoadScript>

      {/* Manual coordinate inputs for precise location */}
      <div className="absolute bottom-2 left-2 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          Location Coordinates:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-500 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={handleLatChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-500 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={handleLngChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 text-center">
          Click on map or adjust coordinates
        </p>
      </div>

      {/* Google Maps link */}
      <a
        href={`https://maps.google.com/?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg shadow-md text-xs text-accent hover:text-blue-700 transition-colors font-medium"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}
