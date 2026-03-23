"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Route protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Synchronizing..." />;
  }

  if (!user) return null;

  // Dynamic Breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    // Format name: 'Admin' -> 'Dashboard', others capitalize
    const name = segment.toLowerCase() === 'admin' ? 'Dashboard' : segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href };
  });

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex antialiased selection:bg-blue-50 selection:text-blue-600">
      {/* Sidebar with collapse state */}
      <AdminSidebar isCollapsed={isCollapsed} />

      {/* Main Content Area */}
      <main className={`flex-grow transition-all duration-500 ease-in-out ${isCollapsed ? 'pl-24' : 'pl-72'}`}>

        {/* Top Header Section - Inheriting Quicksand globally */}
        <header className="h-24 flex items-center justify-between px-10 sticky top-0 z-20 bg-[#FDFDFE]/90 backdrop-blur-md">

          {/* Left: Minimalist Breadcrumbs & Toggle */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl active:scale-95"
              title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
            >
              <svg className={`w-6 h-6 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumbs - text-[16px] for clarity */}
            <nav className="flex items-center space-x-2 text-[16px] font-bold leading-none">
              <Link href="/admin" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>

              <span className="text-slate-200 select-none pb-0.5 opacity-60 font-medium">/</span>

              <div className="flex items-center">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.href}>
                    <Link
                      href={crumb.href}
                      className={`px-3.5 py-2 transition-all tracking-tight rounded-xl
                        ${idx === breadcrumbs.length - 1
                          ? 'text-slate-900 font-bold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold'
                        }`}
                    >
                      {crumb.name}
                    </Link>
                    {idx < breadcrumbs.length - 1 && (
                      <span className="text-slate-200 select-none px-1 pb-0.5 opacity-60 font-medium">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </nav>
          </div>

          {/* Right: Modern Search Bar */}
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-slate-500 group-focus-within:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-12 py-3 bg-slate-50/50 hover:bg-slate-50/80 border-none rounded-2xl text-[15px] transition-all focus:outline-none focus:ring-4 focus:ring-blue-100/30 focus:bg-white focus:w-80 placeholder:text-slate-400 font-bold"
                placeholder="Search..."
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-25 group-focus-within:opacity-0 transition-opacity">
                <span className="text-[11px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md uppercase tracking-tight">⌘ K</span>
              </div>
            </div>

            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 rounded-2xl transition-all relative group border border-transparent hover:border-blue-100/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full border-2 border-[#FDFDFE]"></div>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-10 py-8 max-w-[1700px]">
          {children}
        </div>
      </main>
    </div>
  );
}
