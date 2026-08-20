"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { formatPrice, formatArea } from "@/utils/filters";
import {
  X,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Phone,
  MessageCircle,
  Home,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { deleteProperty } from "@/utils/propertyStorage";

export default function PropertyDetails({ onPropertyDeleted }: { onPropertyDeleted?: () => void }) {
  const { selectedProperty, showPropertyDetails, setShowPropertyDetails, setSelectedProperty } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!showPropertyDetails || !selectedProperty) return null;

  const handleClose = () => {
    setShowPropertyDetails(false);
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close when clicking the backdrop
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProperty.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedProperty.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in: ${selectedProperty.title}\nPrice: ${formatPrice(selectedProperty.price)}`
    );
    window.open(
      `https://wa.me/${selectedProperty.seller.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`,
      "_blank"
    );
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    
    if (confirm("Are you sure you want to delete this property?")) {
      const success = await deleteProperty(selectedProperty.id);
      if (success) {
        setShowPropertyDetails(false);
        onPropertyDeleted?.();
      } else {
        alert("Failed to delete property");
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[1001] animate-fadeIn"
        onClick={handleBackdropClick}
      />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white dark:bg-gray-800 z-[1002] overflow-y-auto animate-slideInRight shadow-2xl">
        {/* Close Button */}
        <div className="sticky top-0 right-0 z-[1003] flex gap-2 p-4 justify-end">
          <button
            onClick={handleDelete}
            className="p-2 bg-danger rounded-full shadow-lg hover:bg-red-600 transition-colors flex-shrink-0"
            aria-label="Delete property"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700">
          <Image
            src={selectedProperty.images[currentImageIndex]}
            alt={selectedProperty.title}
            fill
            className="object-cover"
            sizes="600px"
            priority
          />

          {/* Image Navigation */}
          {selectedProperty.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-800 dark:text-gray-200" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {selectedProperty.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {selectedProperty.featured && (
            <div className="absolute top-4 left-4 bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Featured Property
            </div>
          )}
        </div>

        {/* Property Information */}
        <div className="p-4 md:p-5 space-y-4">
          {/* Price and Title */}
          <div>
            <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
              {formatPrice(selectedProperty.price)}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedProperty.title}
            </h2>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{selectedProperty.address}</span>
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                <Home className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {selectedProperty.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                <Maximize className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-600 dark:text-gray-400">Area</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {formatArea(selectedProperty.area)}
                </div>
              </div>
            </div>

            {selectedProperty.bedrooms !== undefined && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                  <Bed className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedProperty.bedrooms}
                  </div>
                </div>
              </div>
            )}

            {selectedProperty.bathrooms !== undefined && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                  <Bath className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedProperty.bathrooms}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* District Badge */}
          <div>
            <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              {selectedProperty.district}
            </span>
          </div>

          {/* Seller Information */}
          <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Contact Seller
            </h3>
            <div className="mb-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Seller Name</div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {selectedProperty.seller.name}
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${selectedProperty.seller.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </a>
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Map Location */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Location
            </h3>
            <div className="h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedProperty.location.coordinates.lng - 0.01},${selectedProperty.location.coordinates.lat - 0.01},${selectedProperty.location.coordinates.lng + 0.01},${selectedProperty.location.coordinates.lat + 0.01}&layer=mapnik&marker=${selectedProperty.location.coordinates.lat},${selectedProperty.location.coordinates.lng}`}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
