"use client";

import { useState, useEffect } from "react";
import { X, Upload, Check, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PropertyType, Property } from "@/types/property";
import { addProperty, generatePropertyId } from "@/utils/propertyStorage";
import { getCurrentSession } from "@/utils/auth";
import { getUserById } from "@/utils/auth";

interface FormData {
  price: string;
  type: PropertyType;
  area: string;
  bedrooms: string;
  bathrooms: string;
  district: string;
  address: string;
  sellerPhone: string;
}

const BLANK: FormData = {
  price: "", type: "Apartment",
  area: "", bedrooms: "", bathrooms: "", district: "", address: "",
  sellerPhone: "",
};

export default function AddPropertyModal({
  onPropertyAdded,
}: {
  onPropertyAdded?: (properties?: Property[]) => void;
}) {
  const { showAddProperty, setShowAddProperty, darkMode } = useApp();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormData>(BLANK);
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill seller info from session whenever modal opens
  useEffect(() => {
    const loadUserData = async () => {
      if (!showAddProperty) return;
      const session = await getCurrentSession();
      if (!session) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);
      const user = await getUserById(session.userId);
      if (user) {
        setForm((prev) => ({
          ...prev,
          sellerPhone: user.phone ?? "",
        }));
      }
    };
    loadUserData();
  }, [showAddProperty]);

  if (!showAddProperty) return null;

  const close = () => {
    setShowAddProperty(false);
    setStep(1);
    setForm(BLANK);
    setImages([]);
    setSubmitted(false);
  };

  const set = (key: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const stepValid = () => {
    if (step === 1) return images.length > 0;
    if (step === 2) return !!(form.price && form.area && form.district && form.address);
    return false;
  };

  const handlePublish = async () => {
    if (isLoading) return; // Prevent double submissions
    setIsLoading(true);
    const session = await getCurrentSession();

    const property: Property = {
      id: generatePropertyId(),
      title: `${form.type} in ${form.district}`,
      description: "",
      price: Number(form.price),
      type: form.type,
      area: Number(form.area),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      location: {
        district: form.district,
        address: form.address,
        coordinates: {
          lat: 0,
          lng: 0,
        },
      },
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"],
      seller: {
        name: session?.name || "Anonymous",
        phone: form.sellerPhone || "",
        whatsapp: form.sellerPhone || "",
        email: "",
      },
      createdAt: new Date(),
      status: "pending",
      submittedBy: session?.userId ?? "anonymous",
    };

    const updated = await addProperty(property);
    onPropertyAdded?.(updated);
    setSubmitted(true);
    setIsLoading(false);
    setTimeout(close, 2500);
  };

  // Not logged in guard
  if (!isLoggedIn) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-[1003] animate-fadeIn" onClick={close} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1004] p-8 text-center animate-slideUp">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in required</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            You need to be signed in to add a property listing.
          </p>
          <button onClick={close} className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1003] animate-fadeIn" onClick={close} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[92vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1004] flex flex-col overflow-hidden animate-slideUp">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Property</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={close} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["Photos", "Details"].map((label, i) => (
              <span key={label} className={`text-xs font-medium ${i + 1 === step ? "text-accent" : "text-gray-400"}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {submitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Listing Submitted!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Your property is pending review. It will appear on the map once approved by an admin.
              </p>
            </div>
          ) : (
            <>
              {/* ── Step 1: Photos ── */}
              {step === 1 && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload at least one photo of your property.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 p-1.5 bg-danger rounded-full hover:bg-red-600 transition-colors">
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                      <Upload className="w-7 h-7 text-gray-400 mb-1.5" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Upload Photos</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {/* ── Step 2: Details ── */}
              {step === 2 && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Price (USD) *">
                      <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                        placeholder="125000" className={cls} />
                    </InputField>
                    <InputField label="Property Type *">
                      <select value={form.type} onChange={(e) => set("type", e.target.value as PropertyType)} className={cls}>
                        {["Apartment","House","Land"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </InputField>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <InputField label="Area (m²) *">
                      <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)}
                        placeholder="150" className={cls} />
                    </InputField>
                    {form.type !== "Land" && (
                      <>
                        <InputField label="Bedrooms">
                          <input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                            placeholder="3" className={cls} />
                        </InputField>
                        <InputField label="Bathrooms">
                          <input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                            placeholder="2" className={cls} />
                        </InputField>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="District *">
                      <input type="text" value={form.district} onChange={(e) => set("district", e.target.value)}
                        placeholder="e.g., Duhok Center" className={cls} />
                    </InputField>
                    <InputField label="Address *">
                      <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
                        placeholder="Street name" className={cls} />
                    </InputField>
                  </div>

                  {/* Seller info — phone only */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Contact Info</p>
                    <InputField label="Phone *">
                      <input type="tel" value={form.sellerPhone} onChange={(e) => set("sellerPhone", e.target.value)}
                        placeholder="+964 750 123 4567" className={cls} />
                    </InputField>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 flex justify-between items-center flex-shrink-0">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
              className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!stepValid()}
                className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next →
              </button>
            ) : (
              <button onClick={handlePublish} disabled={!stepValid() || isLoading}
                className="px-6 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Publishing..." : "Submit Listing"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const cls = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400";
