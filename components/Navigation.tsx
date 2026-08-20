"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Home, User, Shield, LogOut, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PropertyType, AuthSession } from "@/types/property";
import { getCurrentSession, logout } from "@/utils/auth";
import { getPendingCount, getUnreadCount } from "@/utils/propertyStorage";
import AuthModal from "./AuthModal";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

const PROPERTY_TYPES: (PropertyType | "All")[] = [
  "All", "Apartment", "House", "Land",
];

interface NavigationProps {
  onPropertiesUpdate: () => void;
}

export default function Navigation({ onPropertiesUpdate }: NavigationProps) {
  const { filters, setFilters, setShowAddProperty } = useApp();

  // Auth state
  const [session, setSession] = useState<AuthSession | null>(null);

  // Modal visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminDash, setShowAdminDash] = useState(false);
  const [showUserDash, setShowUserDash] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Notification / pending badge
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Price range dropdown
  const [showPrice, setShowPrice] = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);
  
  // Property type dropdown
  const [showType, setShowType] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  
  // User menu
  const menuRef = useRef<HTMLDivElement>(null);

  // Bootstrap session on mount and poll counts
  useEffect(() => {
    const initSession = async () => {
      const s = await getCurrentSession();
      setSession(s);
      await updateCounts();
    };
    initSession();
    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) setShowPrice(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setShowType(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateCounts = async () => {
    const pending = await getPendingCount();
    const unread = await getUnreadCount();
    setPendingCount(pending);
    setUnreadCount(unread);
  };

  const handleLoginSuccess = async (s: AuthSession) => {
    setSession(s);
    await updateCounts();
    // Immediately open the correct dashboard
    if (s.role === "admin") setShowAdminDash(true);
    else setShowUserDash(true);
  };

  const handleLogout = async () => {
    await logout();
    setSession(null);
    setShowAdminDash(false);
    setShowUserDash(false);
    setShowUserMenu(false);
    onPropertiesUpdate();
  };

  const handleDashboardClick = () => {
    setShowUserMenu(false);
    if (!session) { setShowAuthModal(true); return; }
    if (session.role === "admin") setShowAdminDash(true);
    else setShowUserDash(true);
  };

  const handleAddProperty = () => {
    if (!session) { setShowAuthModal(true); return; }
    setShowAddProperty(true);
  };

  const totalBadge = pendingCount + unreadCount;

  return (
    <>
      <nav className="fixed top-0 right-0 z-[1000] p-2 sm:p-3 md:p-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg px-2 sm:px-3 md:px-4 py-2 flex items-center gap-1 sm:gap-2 md:gap-3">

          {/* Property type */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setShowType(!showType)}
              className={`py-2 sm:py-2 md:py-2 px-4 sm:px-3 md:px-3 text-xs sm:text-sm border rounded-lg sm:rounded-xl transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-shrink-0 min-h-[44px] ${
                showType || (filters.type && filters.type !== "All")
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {filters.type && filters.type !== "All" ? filters.type : "Type"}{(filters.type && filters.type !== "All") ? " ✓" : ""}
            </button>

            {showType && (
              <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 w-48 z-50 animate-slideUp">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Property Type</p>
                <div className="space-y-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilters({ ...filters, type: type as PropertyType | "All" });
                        setShowType(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.type === type
                          ? "bg-accent text-white font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price range */}
          <div className="relative" ref={priceRef}>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`py-2 sm:py-2 md:py-2 px-4 sm:px-3 md:px-3 text-xs sm:text-sm border rounded-lg sm:rounded-xl transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-shrink-0 min-h-[44px] ${
                showPrice || filters.minPrice || filters.maxPrice
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              Price{(filters.minPrice || filters.maxPrice) ? " ✓" : ""}
            </button>

            {showPrice && (
              <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-72 z-50 animate-slideUp">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Price Range (USD)</p>
                <div className="space-y-3">
                  {[
                    { label: "Min Price", key: "minPrice" as const, placeholder: "0" },
                    { label: "Max Price", key: "maxPrice" as const, placeholder: "No limit" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <input
                        type="number"
                        placeholder={placeholder}
                        value={filters[key] || ""}
                        onChange={(e) => setFilters({ ...filters, [key]: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => { setFilters({ ...filters, minPrice: undefined, maxPrice: undefined }); setShowPrice(false); }}
                    className="w-full py-2 text-xs text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Clear price filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add property */}
          <button
            onClick={handleAddProperty}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-4 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 bg-accent hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Property</span>
          </button>

          {/* User / Auth button */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            {session ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-2 sm:py-2 md:py-2 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative flex-shrink-0 min-h-[44px]"
                >
                  <div className={`w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${session.role === "admin" ? "bg-accent" : "bg-gray-500"}`}>
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-xs sm:text-sm font-medium text-gray-900 dark:text-white max-w-[60px] sm:max-w-[80px] truncate">
                    {session.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  {/* Badge for admin */}
                  {session.role === "admin" && totalBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {totalBadge > 9 ? "9+" : totalBadge}
                    </span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-slideUp">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{session.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{session.username}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${session.role === "admin" ? "bg-accent/10 text-accent" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                        {session.role === "admin" ? "Administrator" : "User"}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {session.role === "admin"
                          ? <><Shield className="w-4 h-4 text-accent" /> Admin Dashboard {totalBadge > 0 && <span className="ml-auto w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">{totalBadge}</span>}</>
                          : <><User className="w-4 h-4 text-gray-400" /> My Dashboard</>
                        }
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); handleAddProperty(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Plus className="w-4 h-4 text-gray-400" /> Add Property
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0 min-h-[44px]"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Admin dashboard */}
      {showAdminDash && session && (
        <AdminDashboard
          session={session}
          onClose={() => setShowAdminDash(false)}
          onLogout={handleLogout}
          onPropertyUpdate={() => { updateCounts(); onPropertiesUpdate(); }}
        />
      )}

      {/* User dashboard */}
      {showUserDash && session && (
        <UserDashboard
          session={session}
          onClose={() => setShowUserDash(false)}
          onLogout={handleLogout}
          onPropertiesUpdate={() => { updateCounts(); onPropertiesUpdate(); }}
        />
      )}
    </>
  );
}
