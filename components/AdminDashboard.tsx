"use client";

import { useState, useEffect } from "react";
import {
  X, Check, XCircle, Trash2, Bell, Eye,
  Clock, CheckCircle, AlertCircle, Users, Home,
  Shield, LogOut, Edit2
} from "lucide-react";
import { Property, AuthSession, PropertyType } from "@/types/property";
import {
  loadPendingProperties, loadAllProperties,
  approveProperty, rejectProperty, deleteProperty,
  loadNotifications, markNotificationRead,
  markAllNotificationsRead, clearNotifications,
  getUnreadCount, Notification, updateProperty,
} from "@/utils/propertyStorage";
import { getUsers, makeUserAdmin, deleteUser, logout } from "@/utils/auth";
import { formatPrice, formatArea } from "@/utils/filters";
import { User } from "@/types/property";

interface AdminDashboardProps {
  session: AuthSession;
  onClose: () => void;
  onLogout: () => void;
  onPropertyUpdate: () => void;
}

type Tab = "pending" | "all" | "users" | "notifications";

const STATUS_PILL: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  approved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function AdminDashboard({
  session,
  onClose,
  onLogout,
  onPropertyUpdate,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<Property[]>([]);
  const [all, setAll] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preview, setPreview] = useState<Property | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editModal, setEditModal] = useState<Property | null>(null);

  useEffect(() => { 
    const loadData = async () => {
      await refresh();
    };
    loadData();
  }, []);

  const refresh = async () => {
    const [pendingProps, allProps, usersList, notifsList] = await Promise.all([
      loadPendingProperties(),
      loadAllProperties(),
      getUsers(),
      loadNotifications()
    ]);
    setPending(pendingProps);
    setAll(allProps);
    setUsers(usersList);
    setNotifications(notifsList);
  };

  const handleApprove = async (id: string) => {
    const property = pending.find(p => p.id === id);
    if (property) {
      // Open edit modal for pending property to set coordinates before approval
      setEditModal(property);
    }
  };

  const openReject = (id: string) => {
    setRejectReason("");
    setRejectModal({ id });
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    const success = await rejectProperty(rejectModal.id, rejectReason);
    if (success) {
      setRejectModal(null);
      await refresh();
      onPropertyUpdate();
    } else {
      alert("Failed to reject property");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this property?")) return;
    const success = await deleteProperty(id);
    if (success) {
      await refresh();
      onPropertyUpdate();
    } else {
      alert("Failed to delete property");
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm("Promote this user to admin?")) return;
    const result = await makeUserAdmin(userId);
    if (result.success) {
      await refresh();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user account?")) return;
    const result = await deleteUser(userId);
    if (result.success) {
      await refresh();
    } else {
      alert(result.message);
    }
  };

  const handleNotifClick = async (n: Notification) => {
    await markNotificationRead(n.id);
    const prop = all.find((p) => p.id === n.propertyId);
    if (prop) { setPreview(prop); setTab("pending"); }
    await refresh();
  };

  const unread = notifications.filter(n => !n.read).length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "pending", label: `Pending (${pending.length})` },
    { id: "all", label: `All (${all.length})` },
    { id: "users", label: `Users (${users.length})` },
    { id: "notifications", label: "Notifications", badge: unread },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1005] animate-fadeIn" onClick={onClose} />

      <div className="fixed inset-4 md:inset-6 bg-white dark:bg-gray-800 z-[1006] rounded-2xl shadow-2xl animate-slideUp flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as {session.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-danger border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-accent text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* ── Pending ── */}
          {tab === "pending" && (
            pending.length === 0
              ? <EmptyState icon={CheckCircle} message="No pending listings — all caught up!" />
              : pending.map((p) => (
                  <PropertyRow
                    key={p.id} property={p}
                    onView={setPreview}
                    onApprove={handleApprove}
                    onReject={openReject}
                    onDelete={handleDelete}
                    onEdit={setEditModal}
                    showApproveReject
                  />
                ))
          )}

          {/* ── All ── */}
          {tab === "all" && (
            all.length === 0
              ? <EmptyState icon={Home} message="No properties yet." />
              : all.map((p) => (
                  <PropertyRow
                    key={p.id} property={p}
                    onView={setPreview}
                    onApprove={handleApprove}
                    onReject={openReject}
                    onDelete={handleDelete}
                    onEdit={setEditModal}
                    showApproveReject={p.status === "pending"}
                  />
                ))
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            users.length === 0
              ? <EmptyState icon={Users} message="No users registered." />
              : users.map((u) => (
                  <div key={u.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${u.role === "admin" ? "bg-accent" : "bg-gray-400"}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${u.role === "admin" ? "bg-accent/10 text-accent" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"}`}>
                              {u.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username} · {u.email}</p>
                          {u.phone && <p className="text-xs text-gray-400 dark:text-gray-500">{u.phone}</p>}
                        </div>
                      </div>
                      {u.id !== session.userId && (
                        <div className="flex gap-2 flex-shrink-0">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleMakeAdmin(u.id)}
                              className="px-3 py-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors font-medium"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            notifications.length === 0
              ? <EmptyState icon={Bell} message="No notifications yet." />
              : (
                <>
                  <div className="flex justify-end gap-3">
                    <button onClick={async () => { await markAllNotificationsRead(); await refresh(); }}
                      className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                      Mark all read
                    </button>
                    <button onClick={async () => { await clearNotifications(); await refresh(); }}
                      className="text-xs text-danger hover:text-red-600">
                      Clear all
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        n.read
                          ? "bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${n.read ? "text-gray-400" : "text-accent"}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">New property submitted</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            <span className="font-medium">{n.sellerName}</span> added &quot;{n.propertyTitle}&quot;
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.timestamp.toLocaleString()}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5 ml-auto" />}
                      </div>
                    </div>
                  ))}
                </>
              )
          )}
        </div>
      </div>

      {/* Property preview modal */}
      {preview && <PropertyPreviewModal property={preview} onClose={() => setPreview(null)} />}

      {/* Edit modal */}
      {editModal && (
        <PropertyEditModal
          property={editModal}
          onClose={() => setEditModal(null)}
          onSave={async (updatedProperty) => {
            const success = await updateProperty(editModal.id, updatedProperty);
            if (success) {
              setEditModal(null);
              await refresh();
              onPropertyUpdate();
            } else {
              alert("Failed to update property");
            }
          }}
        />
      )}



      {/* Reject modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[1007]" onClick={() => setRejectModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1008] p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Reject Listing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Optionally tell the user why it was rejected.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={confirmReject}
                className="flex-1 py-2.5 bg-danger hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                Reject Property
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── PropertyRow ─────────────────────────────────────────────────────────────

function PropertyRow({
  property, onView, onApprove, onReject, onDelete, onEdit, showApproveReject,
}: {
  property: Property;
  onView: (p: Property) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (p: Property) => void;
  showApproveReject: boolean;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-600">
          {property.images?.[0] && (
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{property.title}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_PILL[property.status]}`}>
              {property.status}
            </span>
          </div>
          <p className="text-accent font-bold text-sm">{formatPrice(property.price)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {property.type} · {formatArea(property.area)} · {property.district}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By: {property.seller.name} · {property.seller.phone}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => onView(property)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
              <Eye className="w-3.5 h-3.5" /> View
            </button>
            {property.status === "approved" && (
              <button onClick={() => onEdit(property)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {showApproveReject && (
              <>
                <button onClick={() => onApprove(property.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-success hover:bg-green-600 text-white rounded-lg transition-colors">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => onReject(property.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-danger hover:bg-red-600 text-white rounded-lg transition-colors">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
            <button onClick={() => onDelete(property.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

// ─── PropertyPreviewModal ─────────────────────────────────────────────────────

function PropertyPreviewModal({ property, onClose }: { property: Property; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1007]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1008] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">{property.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {property.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {property.images.slice(0, 4).map((img, i) => (
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={i} src={img} alt="" className="w-full h-36 object-cover rounded-lg" />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Price", formatPrice(property.price)],
              ["Type", property.type],
              ["Area", formatArea(property.area)],
              ["District", property.district],
              ...(property.bedrooms ? [["Bedrooms", String(property.bedrooms)]] : []),
              ...(property.bathrooms ? [["Bathrooms", String(property.bathrooms)]] : []),
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{property.description}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Seller Info</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{property.seller.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{property.seller.phone}</p>
            {property.seller.email && <p className="text-sm text-gray-500 dark:text-gray-400">{property.seller.email}</p>}
          </div>
        </div>
      </div>
    </>
  );
}


// ─── PropertyEditModal ─────────────────────────────────────────────────────

function PropertyEditModal({
  property,
  onClose,
  onSave,
}: {
  property: Property;
  onClose: () => void;
  onSave: (updates: Partial<Property>) => void;
}) {
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    price: String(property.price),
    area: String(property.area),
    bedrooms: String(property.bedrooms || ""),
    bathrooms: String(property.bathrooms || ""),
    type: property.type,
    address: property.location.address,
    district: property.location.district,
    coordinates: `${property.location.coordinates.lat}, ${property.location.coordinates.lng}`,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<Property> = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      type: formData.type as any,
      location: {
        ...property.location,
        address: formData.address,
        district: formData.district,
      },
    };
    await onSave(updates);
    setSaving(false);
  };

  const handleApprove = async () => {
    // Validate and extract coordinates
    const coordMatch = formData.coordinates.trim().match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (!coordMatch) {
      alert("Please enter valid coordinates in format: 36.881611, 42.920313");
      return;
    }

    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    if (lat === 0 && lng === 0) {
      alert("Invalid coordinates. Please enter valid latitude and longitude");
      return;
    }

    setSaving(true);
    const updates: Partial<Property> = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      type: formData.type as any,
      location: {
        ...property.location,
        address: formData.address,
        district: formData.district,
        coordinates: { lat, lng },
      },
      status: "approved",
    };
    await onSave(updates);
    setSaving(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1007]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1008] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Listing</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{property.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Price and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price (USD)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Property Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                className={inputClass}
              >
                {["Apartment", "House", "Villa", "Land", "Commercial", "Office"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area, Bedrooms, Bathrooms */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Area (m²)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bedrooms
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bathrooms
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* District and Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                District
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Coordinates - shown for all, required for pending properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Coordinates {property.status === "pending" && <span className="text-danger">*</span>}
            </label>
            <input
              type="text"
              value={formData.coordinates}
              onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
              placeholder="36.881611, 42.920313"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1.5">Format: latitude, longitude (e.g., 36.881611, 42.920313)</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          {property.status === "pending" ? (
            <button
              onClick={handleApprove}
              disabled={saving}
              className="px-4 py-2.5 text-sm text-white bg-success hover:bg-green-600 disabled:opacity-50 rounded-lg transition-colors font-medium"
            >
              {saving ? "Approving..." : "Approve & List"}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 text-sm text-white bg-accent hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
