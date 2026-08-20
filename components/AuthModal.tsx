"use client";

import { useState } from "react";
import { X, Lock, User, Mail, Phone, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser, getAuthMode } from "@/utils/auth";
import { AuthSession } from "@/types/property";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const reset = () => {
    setForm({ username: "", email: "", password: "", confirmPassword: "", name: "", phone: "" });
    setError("");
    setSuccessMsg("");
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Passwords don't match.");
          setLoading(false);
          return;
        }
        const result = await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
        });
        if (result.success) {
          // If session was created, auto-login immediately
          if (result.session) {
            onSuccess(result.session);
            onClose();
          } else {
            // Otherwise, show success and switch to login
            setSuccessMsg("Account created! You can now sign in.");
            setMode("login");
            setForm((prev) => ({ ...prev, password: "", confirmPassword: "", email: "", name: "", phone: "" }));
          }
        } else {
          setError(result.message);
        }
      } else {
        // For Supabase, always use email for login
        const result = await loginUser(form.email || form.username, form.password);
        if (result.success && result.session) {
          onSuccess(result.session);
          onClose();
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }

    setLoading(false);
  };

  const authMode = getAuthMode();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1005] animate-fadeIn" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[1006] animate-slideUp overflow-y-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {mode === "login" ? "Sign in to your account" : "Join Duhok Real Estate"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Hint for Supabase login */}
          {mode === "login" && authMode === "supabase" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold text-blue-800 dark:text-blue-200">Supabase mode</p>
              <p className="mt-1">Sign in with your <strong>email</strong> and password.</p>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-success">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email for login */}
            {mode === "login" && (
              <Field label="Email *">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required value={form.email} onChange={set("email")}
                    placeholder="you@example.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            )}

            {mode === "register" && (
              <Field label="Full Name *">
                <input
                  type="text" required value={form.name} onChange={set("name")}
                  placeholder="Ahmad Hassan"
                  className={inputCls}
                />
              </Field>
            )}

            {mode === "register" && (
              <Field label="Email *">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required value={form.email} onChange={set("email")}
                    placeholder="you@example.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            )}

            {mode === "register" && (
              <Field label="Phone (optional)">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" value={form.phone} onChange={set("phone")}
                    placeholder="+964 750 123 4567"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            )}

            <Field label="Password *">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"} required value={form.password} onChange={set("password")}
                  placeholder={mode === "register" ? "Min 6 characters" : "Enter password"}
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {mode === "register" && (
              <Field label="Confirm Password *">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"} required value={form.confirmPassword} onChange={set("confirmPassword")}
                    placeholder="Repeat password"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? mode === "login" ? "Signing in…" : "Creating account…"
                : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400";
