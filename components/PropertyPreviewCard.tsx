"use client";

import Image from "next/image";
import { Property } from "@/types/property";
import { useApp } from "@/context/AppContext";
import { formatPrice, formatArea } from "@/utils/filters";
import { Home, Maximize, MapPin } from "lucide-react";

interface PropertyPreviewCardProps {
  property: Property;
}

export default function PropertyPreviewCard({ property }: PropertyPreviewCardProps) {
  const { setSelectedProperty, setShowPropertyDetails } = useApp();

  const handleViewDetails = () => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Property Image */}
      <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-700">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover"
          sizes="320px"
        />
        {property.featured && (
          <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="p-3">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mb-2">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{property.district}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Home className="w-3 h-3" />
            <span>{property.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-3 h-3" />
            <span>{formatArea(property.area)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-bold text-accent">
            {formatPrice(property.price)}
          </div>
          <button
            onClick={handleViewDetails}
            className="px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium whitespace-nowrap"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
