import { Property } from "@/types/property";
import { supabase } from "./supabase";

// ============================================================================
// SUPABASE ONLY - NO LOCALSTORAGE FALLBACK
// ============================================================================

export interface Notification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  sellerName: string;
  sellerId: string;
  timestamp: Date;
  read: boolean;
}

function mapDbPropertyToProperty(dbProp: any): Property {
  // Convert lowercase database type back to capitalized PropertyType
  const typeMap: Record<string, PropertyType> = {
    "apartment": "Apartment",
    "house": "House",
    "villa": "Villa",
    "land": "Land",
    "commercial": "Commercial",
    "office": "Office",
  };

  return {
    id: dbProp.id,
    title: dbProp.title,
    description: dbProp.description,
    price: Number(dbProp.price),
    type: typeMap[dbProp.property_type?.toLowerCase()] || "Apartment", // ✅ FIXED: Map back to capitalized
    area: Number(dbProp.area),
    bedrooms: dbProp.bedrooms,
    bathrooms: dbProp.bathrooms,
    location: {
      district: dbProp.district,
      address: dbProp.address,
      coordinates: {
        lat: Number(dbProp.latitude),
        lng: Number(dbProp.longitude),
      },
    },
    images: dbProp.images || [],
    seller: {
      name: dbProp.seller_name,
      phone: dbProp.seller_phone,
      email: dbProp.seller_email,
    },
    status: dbProp.status,
    submittedBy: dbProp.submitted_by,
    rejectionReason: dbProp.rejection_reason,
    createdAt: new Date(dbProp.created_at),
  };
}

function mapPropertyToDbProperty(property: Property): any {
  return {
    title: property.title,
    description: property.description,
    price: Math.min(Number(property.price) || 0, 999999999), // Cap at ~1 billion
    property_type: property.type.toLowerCase(),
    area: Math.min(Number(property.area) || 0, 999999999), // Cap at ~1 billion
    bedrooms: property.bedrooms ? parseInt(property.bedrooms.toString()) : null,
    bathrooms: property.bathrooms ? parseInt(property.bathrooms.toString()) : null,
    district: property.location.district,
    address: property.location.address,
    latitude: property.location.coordinates.lat,
    longitude: property.location.coordinates.lng,
    images: property.images,
    seller_name: property.seller.name,
    seller_phone: property.seller.phone,
    seller_email: property.seller.email,
    status: property.status || "pending",
    submitted_by: property.submittedBy,
  };
}

/** Only approved listings – shown on the public map */
export async function loadProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading properties:", error);
      return [];
    }

    return data.map(mapDbPropertyToProperty);
  } catch (error) {
    console.error("Error loading properties:", error);
    return [];
  }
}

/** All properties – admin only */
export async function loadAllProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading all properties:", error);
      return [];
    }

    return data.map(mapDbPropertyToProperty);
  } catch (error) {
    console.error("Error loading all properties:", error);
    return [];
  }
}

/** Pending only – admin only */
export async function loadPendingProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[LOAD PENDING] Error:", error);
      return [];
    }

    console.log("[LOAD PENDING] Found", data?.length || 0, "pending properties:", data);
    return (data || []).map(mapDbPropertyToProperty);
  } catch (error) {
    console.error("[LOAD PENDING] Exception:", error);
    return [];
  }
}

/** Properties submitted by a specific user */
export async function loadUserProperties(userId: string): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading user properties:", error);
      return [];
    }

    return data.map(mapDbPropertyToProperty);
  } catch (error) {
    console.error("Error loading user properties:", error);
    return [];
  }
}

export async function getPendingCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Error getting pending count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting pending count:", error);
    return 0;
  }
}

/** Add new property – always starts as pending */
export async function addProperty(property: Property): Promise<Property[]> {
  try {
    // Verify user is actually logged in before submitting
    if (!property.submittedBy || property.submittedBy === "anonymous") {
      console.error("[ADD PROPERTY] Error: Not logged in properly. submittedBy:", property.submittedBy);
      return [];
    }

    const dbProperty = mapPropertyToDbProperty({
      ...property,
      status: "pending",
    });

    console.log("[ADD PROPERTY] Creating property with data:", {
      ...dbProperty,
      images: Array.isArray(dbProperty.images) ? dbProperty.images.length + " images" : dbProperty.images,
    });

    const { data, error } = await supabase
      .from("properties")
      .insert([dbProperty])
      .select()
      .single();

    if (error) {
      console.error("[ADD PROPERTY] Error:", error);
      console.error("[ADD PROPERTY] Error details:", JSON.stringify(error, null, 2));
      console.error("[ADD PROPERTY] submitted_by was:", property.submittedBy);
      return [];
    }

    console.log("[ADD PROPERTY] Success! Created property:", data);

    // Notification is auto-created by database trigger
    return await loadAllProperties();
  } catch (error: any) {
    console.error("[ADD PROPERTY] Exception:", error);
    return [];
  }
}

/** Approve – admin only */
export async function approveProperty(id: string): Promise<boolean> {
  try {
    console.log("[APPROVE PROPERTY] Approving property:", id);
    const { error } = await supabase
      .from("properties")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.error("[APPROVE PROPERTY] Error:", error);
      return false;
    }

    console.log("[APPROVE PROPERTY] Success!");
    return true;
  } catch (error) {
    console.error("[APPROVE PROPERTY] Exception:", error);
    return false;
  }
}

/** Reject – admin only */
export async function rejectProperty(id: string, reason?: string): Promise<boolean> {
  try {
    const updates: any = { status: "rejected" };
    if (reason) {
      updates.rejection_reason = reason;
    }

    console.log("[REJECT PROPERTY] Rejecting property:", id, "Reason:", reason);

    const { error } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[REJECT PROPERTY] Error:", error);
      return false;
    }

    console.log("[REJECT PROPERTY] Success!");
    return true;
  } catch (error) {
    console.error("[REJECT PROPERTY] Exception:", error);
    return false;
  }
}

/** Delete permanently */
export async function deleteProperty(id: string): Promise<boolean> {
  try {
    console.log("[DELETE PROPERTY] Deleting property:", id);
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[DELETE PROPERTY] Error:", error);
      return false;
    }

    console.log("[DELETE PROPERTY] Success!");
    return true;
  } catch (error) {
    console.error("[DELETE PROPERTY] Exception:", error);
    return false;
  }
}

/** Update arbitrary fields */
export async function updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.type) dbUpdates.property_type = updates.type.toLowerCase(); // ✅ Convert to lowercase for DB constraint
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.rejectionReason) dbUpdates.rejection_reason = updates.rejectionReason;
    
    if (updates.location) {
      if (updates.location.district) dbUpdates.district = updates.location.district;
      if (updates.location.address) dbUpdates.address = updates.location.address;
      if (updates.location.coordinates) {
        dbUpdates.latitude = updates.location.coordinates.lat;
        dbUpdates.longitude = updates.location.coordinates.lng;
      }
    }
    
    if (updates.seller) {
      if (updates.seller.name) dbUpdates.seller_name = updates.seller.name;
      if (updates.seller.phone) dbUpdates.seller_phone = updates.seller.phone;
      if (updates.seller.email) dbUpdates.seller_email = updates.seller.email;
    }
    
    if (updates.images) dbUpdates.images = updates.images;

    console.log("[UPDATE PROPERTY] Updating property:", id, "with updates:", dbUpdates);

    const { error } = await supabase
      .from("properties")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("[UPDATE PROPERTY] Error:", error);
      return false;
    }

    console.log("[UPDATE PROPERTY] Success!");
    return true;
  } catch (error) {
    console.error("[UPDATE PROPERTY] Exception:", error);
    return false;
  }
}

export function generatePropertyId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** Load notifications */
export async function loadNotifications(): Promise<Notification[]> {
  try {
    // Join notifications with properties to get seller info
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        property_id,
        read,
        created_at,
        properties (
          title,
          submitted_by,
          seller_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[LOAD NOTIFICATIONS] Error:", error);
      return [];
    }

    console.log("[LOAD NOTIFICATIONS] Raw data:", data);

    return data.map((n: any) => {
      const prop = n.properties;
      return {
        id: n.id,
        propertyId: n.property_id || "",
        propertyTitle: prop?.title || "Unknown Property",
        sellerName: prop?.seller_name || "Unknown Seller",
        sellerId: prop?.submitted_by || "",
        timestamp: new Date(n.created_at),
        read: n.read,
      };
    });
  } catch (error) {
    console.error("[LOAD NOTIFICATIONS] Exception:", error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
  } catch (error) {
    console.error("Error marking notification read:", error);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
  } catch (error) {
    console.error("Error marking all notifications read:", error);
  }
}

export async function clearNotifications(): Promise<void> {
  try {
    await supabase
      .from("notifications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

// Helper to check which mode we're using
export function getStorageMode(): "supabase" {
  return "supabase";
}
