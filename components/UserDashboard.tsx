"use client";

import { useState, useEffect } from "react";
import {
  X, Plus, Clock, CheckCircle, XCircle, Trash2, Eye,
  Home, User, Phone, Mail, AlertCircle, Edit2
} from "lucide-react";
import { Property, AuthSession } from "@/types/property";
import { loadUserProperties, deleteProperty } from "@/utils/propertyStorage";
import { getCurrentSession, logout, updateUserProfile, getUserById } from "@/utils/auth";
import { formatPrice, formatArea } from "@/utils/filters";
import { useApp } from "@/context/AppContext";

interface UserDashboardProps {
  session: AuthSession;
  onClose: () => void;
  onLogout: () => void;
  onPropertiesUpdate: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  },
};

export default function UserDashboard({
  session,
  onClose,
  onLogout,
  onPropertiesUpdate,
}: UserDashboardProps) {
  const { setShowAddProperty } = useApp();
  const [tab, setTab] = useState<"listings" | "profile">("listings");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", email: "" });
  const [profileMsg, setProfileMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      await refresh();
      const user = await getUserById(session.userId);
      if (user) {
        setProfileForm({ name: user.name, phone: user.phone ?? "", email: user.email });
      }
    };
    loadData();
  }, [session.userId]);

  const refresh = async () => {
    const props = await loadUserProperties(session.userId);
    setProperties(props);
  };

  const handleDelete = async (id: string) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    if (prop.status === "approved") {
      alert("You cannot delete an approved listing. Contact admin.");
      return;
    }
    if (!confirm("Delete this listing?")) return;
    const success = await deleteProperty(id);
    if (success) {
      await refresh();
      onPropertiesUpdate();
    } else {
      alert("Failed to delete property");
    }
  };

  const handleSaveProfile = async () => {
    const result = await updateUserProfile(session.userId, {
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
    });
    setProfileMsg(result.message);
    setEditing(false);
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const handleAddNew = () => {
    onClose();
    setTimeout(() => setShowAddProperty(true), 150);
  };

  const counts = {
    total: properties.length,
    approved: properties.filter((p) => p.status === "approved").length,
    pending: properties.filter((p) => p.status === "pending").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1005] animate-fadeIn" onClick={onClose} />

      <div className="fixed top-0 right-0 bottom-0 w-full md:w-[520px] bg-white dark:bg-gray-800 z-[1006] flex flex-col animate-slideInRight shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{session.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{session.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-danger border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              >
                Sign out
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: counts.total, color: "text-gray-900 dark:text-white" },
              { label: "Live", value: counts.approved, color: "text-success" },
              { label: "Pending", value: counts.pending, color: "text-yellow-600" },
              { label: "Rejected", value: counts.rejected, color: "text-danger" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(["listings", "profile"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-accent text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t === "listings" ? "My Listings" : "Profile"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* ── Listings Tab ── */}
          {tab === "listings" && (
            <>
              <button
                onClick={handleAddNew}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-accent/40 hover:border-accent text-accent hover:bg-accent/5 rounded-xl transition-all text-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                Add New Listing
              </button>

              {properties.length === 0 ? (
                <div className="text-center py-16">
                  <Home className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">No listings yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Click the button above to add your first property.
                  </p>
                </div>
              ) : (
                properties.map((p) => <ListingCard key={p.id} property={p} onView={setSelectedProperty} onDelete={handleDelete} />)
              )}
            </>
          )}

          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <div className="space-y-4">
              {profileMsg && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-success">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {profileMsg}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-4">
                {[
                  { label: "Full Name", key: "name" as const, icon: User, type: "text", placeholder: "Your name" },
                  { label: "Email", key: "email" as const, icon: Mail, type: "email", placeholder: "you@example.com" },
                  { label: "Phone", key: "phone" as const, icon: Phone, type: "tel", placeholder: "+964 750 123 4567" },
                ].map(({ label, key, icon: Icon, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={type}
                        value={profileForm[key]}
                        onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                        disabled={!editing}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Account info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Username</span>
                  <span className="font-medium text-gray-900 dark:text-white">@{session.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Role</span>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                    {session.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property detail preview */}
      {selectedProperty && (
        <PropertyPreviewModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ListingCard({
  property,
  onView,
  onDelete,
}: {
  property: Property;
  onView: (p: Property) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[property.status];
  const Icon = cfg.icon;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-600">
          {property.images?.[0] && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{property.title}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${cfg.cls}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>

          <p className="text-accent font-bold text-sm">{formatPrice(property.price)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {property.type} · {formatArea(property.area)} · {property.location.district}
          </p>

          {/* Rejection reason */}
          {property.status === "rejected" && property.rejectionReason && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-danger">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{property.rejectionReason}</span>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onView(property)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </button>
            {property.status !== "approved" && (
              <button
                onClick={() => onDelete(property.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyPreviewModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const cfg = STATUS_CONFIG[property.status];
  const Icon = cfg.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1007]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1008] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{property.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Images */}
          {property.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {property.images.slice(0, 4).map((img, i) => (
                <div key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-36 object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Status */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.cls}`}>
            <Icon className="w-4 h-4" />
            {cfg.label}
          </div>

          {property.status === "rejected" && property.rejectionReason && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Rejection reason: {property.rejectionReason}</span>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Price", formatPrice(property.price)],
              ["Type", property.type],
              ["Area", formatArea(property.area)],
              ["District", property.location.district],
              ...(property.bedrooms ? [["Bedrooms", String(property.bedrooms)]] : []),
              ...(property.bathrooms ? [["Bathrooms", String(property.bathrooms)]] : []),
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{property.description}</p>
          </div>

          {/* Submitted date */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Submitted: {new Date(property.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </>
  );
}
