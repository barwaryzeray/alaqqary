import { Property, PropertyFilters } from "@/types/property";

export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  return properties.filter((property) => {
    // Filter by type
    if (filters.type && filters.type !== "All" && property.type !== filters.type) {
      return false;
    }

    // Filter by price range
    if (filters.minPrice && property.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && property.price > filters.maxPrice) {
      return false;
    }

    // Filter by location search
    if (filters.searchLocation && filters.searchLocation.trim()) {
      const searchTerm = filters.searchLocation.toLowerCase();
      const matchesDistrict = property.district?.toLowerCase().includes(searchTerm) ?? false;
      const matchesAddress = property.address?.toLowerCase().includes(searchTerm) ?? false;
      const matchesTitle = property.title?.toLowerCase().includes(searchTerm) ?? false;
      
      if (!matchesDistrict && !matchesAddress && !matchesTitle) {
        return false;
      }
    }

    return true;
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} m²`;
}
