"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginSchema } from "@/lib/schemas";
import LoadingScreen from "@/components/LoadingScreen";
import { z } from "zod";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Synchronizing..." />;
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation using Zod
    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      const formattedErrors: any = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect is handled inside AuthContext.login
    } catch (err: any) {
      setError(err || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 antialiased font-sans">

      {/* Ultra-Minimalist Branding */}
      <div className="mb-16 flex flex-col items-center pointer-events-none">
        <h1 className="text-[42px] font-bold text-slate-900 tracking-tighter leading-none mb-2 uppercase">
          Bai<span className="text-blue-600">Scan</span>
        </h1>
        <p className="text-[14px] font-bold text-slate-300 tracking-[0.4em] leading-none uppercase select-none">
          Biometric Kiosk
        </p>
      </div>

      {/* Simplified Login Form with Uppercase Labels and Inputs */}
      <div className="w-full max-w-[360px]">
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-[13px] font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {/* Email section - Uppercase Label & Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-end ml-4 mr-4">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-widest select-none">
                Email Address
              </label>
              {fieldErrors.email && (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@baiscan.com"
              className={`w-full h-16 px-8 rounded-full bg-slate-50 border-2 transition-all font-bold text-slate-800 placeholder:text-slate-200 outline-none text-[16px] font-sans uppercase placeholder:normal-case disabled:opacity-50 ${fieldErrors.email ? 'border-red-100 focus:border-red-200' : 'border-transparent focus:bg-white focus:border-slate-100'
                }`}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password section - Uppercase Label & Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-end ml-4 mr-4">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-widest select-none">
                Password
              </label>
              {fieldErrors.password && (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  {fieldErrors.password}
                </span>
              )}
            </div>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full h-16 px-8 pr-16 rounded-full bg-slate-50 border-2 font-bold text-slate-800 placeholder:text-slate-200 outline-none text-[16px] font-sans uppercase placeholder:normal-case disabled:opacity-50 ${fieldErrors.password ? 'border-red-100 focus:border-red-200' : 'border-transparent focus:bg-white focus:border-slate-100'
                  }`}
                required
                disabled={isSubmitting}
              />
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-2"
                title={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-[18px] tracking-tight shadow-xl shadow-slate-900/10 mt-6 font-sans uppercase disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? "Initialising..." : "Sign In"}
          </button>
        </form>

        <div className="mt-12 text-center opacity-30">
          <button type="button" className="text-[13px] font-bold text-slate-400 hover:text-blue-600 font-sans uppercase tracking-[0.2em] select-none">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
