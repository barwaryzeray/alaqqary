"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Property } from "@/types/property";
import { DUHOK_CENTER } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import PropertyPreviewCard from "./PropertyPreviewCard"; import { ENV } from "@/utils/config";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const options = {
  disableDefaultUI: false,
  zoomControl: false,          // Hide zoom buttons (+ -)
  fullscreenControl: true,
  streetViewControl: false,    // Hide street view button
  mapTypeControl: false,       // Hide map/satellite buttons
  mapTypeId: "roadmap" as const, // Changed from hybrid to roadmap for faster loading
  gestureHandling: "greedy" as const, // Allow single finger drag on mobile
};

interface MapProps {
  properties: Property[];
}

export default function Map({ properties }: MapProps) {
  const { setSelectedProperty, setShowPropertyDetails, userLocation, setUserLocation } = useApp();
  const [mounted, setMounted] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const isInitialLoadRef = useRef(true);
  const apiKey = ENV.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const center = {
    lat: DUHOK_CENTER.lat,
    lng: DUHOK_CENTER.lng,
  };

  // Custom SVG icon for property listings - Google Maps pin style
  const getPropertyIcon = useCallback(() => {
    // Using a simple blue pin SVG
    const svgMarker = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="rgb(37, 99, 235)"/>
        <circle cx="16" cy="12" r="5" fill="white"/>
      </svg>`;
    
    return {
      url: "data:image/svg+xml;base64," + btoa(svgMarker),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32),
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Silently fail - user location is optional
        }
      );
    }
  }, [setUserLocation]);

  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedMarker(property.id);
    setSelectedProperty(property);
    // Prevent map from re-centering on marker click
  }, [setSelectedProperty]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
    // Prevent map from re-centering on info window close
  }, []);

  const handleMapClick = useCallback(() => {
    // Close the info window when clicking on the map
    setSelectedMarker(null);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    // Center to the desired region only on initial load
    if (isInitialLoadRef.current) {
      mapInstance.panTo(center);
      mapInstance.setZoom(13);
      isInitialLoadRef.current = false;
    }
  }, [center]);

  if (!mounted || !apiKey) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {!apiKey ? "Google Maps API key not configured" : "Loading map..."}
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Map Error</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <LoadScript 
        googleMapsApiKey={apiKey}
        onError={() => {
          setMapError("Failed to load Google Maps. Please check your API key and try again.");
          console.error("Google Maps LoadScript error");
        }}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          options={{
            ...options,
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <MarkerF
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              title="Your Location"
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4F46E5",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }}
            />
          )}

          {/* Property Markers */}
          {properties.map((property) => (
            <MarkerF
              key={property.id}
              position={{
                lat: property.location.coordinates.lat,
                lng: property.location.coordinates.lng,
              }}
              title={property.title}
              icon={getPropertyIcon()}
              onClick={() => handleMarkerClick(property)}
            >
              {selectedMarker === property.id && (
                <InfoWindowF onCloseClick={handleInfoWindowClose} options={{ maxWidth: 340 }}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg" style={{ maxWidth: "340px" }}>
                    <PropertyPreviewCard property={property} />
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

