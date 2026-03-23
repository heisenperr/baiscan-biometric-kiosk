"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface Category {
  title: string;
  items: MenuItem[];
}

const categories: Category[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/admin",
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        name: "Notification",
        path: "/admin/management/notification",
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out bg-white flex flex-col z-30 antialiased border-r border-slate-100/50 overflow-hidden
        ${isCollapsed ? 'w-24' : 'w-72'}
      `}
    >
      
      {/* Brand Header */}
      <div className={`px-8 h-24 flex items-center transition-all duration-500 ${isCollapsed ? 'justify-center mb-4' : ''}`}>
        <Link href="/admin" className="flex items-center group">
          
          {/* Logo Icon Area */}
          <div className="relative flex-shrink-0 transition-all duration-500">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
          </div>

          {/* Smooth Brand Text */}
          <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 ml-0 pointer-events-none' : 'w-56 opacity-100 ml-4'}`}>
            <span className="text-[24px] font-bold text-slate-800 tracking-tighter leading-none mb-0.5 uppercase whitespace-nowrap">
              Bai<span className="text-blue-600">Scan</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] leading-none uppercase select-none whitespace-nowrap">
              Biometric Kiosk
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar transition-all duration-500">
        {categories.map((category) => (
          <div key={category.title} className="mb-6 last:mb-0">
            {/* Category Header */}
            <div className={`overflow-hidden transition-all duration-500 ${isCollapsed ? 'h-px bg-slate-50 mx-4 mb-4 opacity-50' : 'h-8 px-5 mb-1'}`}>
              {!isCollapsed && (
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] select-none opacity-60 transition-opacity duration-300">
                  {category.title}
                </h3>
              )}
            </div>
            
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    title={isCollapsed ? item.name : ""}
                    className={`
                      flex items-center transition-all duration-500 group rounded-2xl relative select-none
                      ${isCollapsed ? 'justify-center px-0 py-4 mb-1' : 'px-5 py-3.5 mb-0.5'}
                      ${isActive 
                        ? 'text-slate-900 font-bold bg-slate-50/60' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 font-bold'
                      }
                    `}
                  >
                    {/* Active Indicator bar */}
                    <div className={`absolute left-0 bg-blue-600 transition-all duration-500 ${isActive ? (isCollapsed ? 'w-1 h-7 rounded-r-xl opacity-100' : 'w-1.5 h-7 rounded-xl ml-0 opacity-100') : 'w-0 h-7 opacity-0'}`}></div>

                    <div className={`
                      transition-all duration-500 flex-shrink-0
                      ${isCollapsed ? 'mx-0' : 'mr-5'}
                      ${isActive ? 'text-blue-600 scale-110' : 'text-slate-200 group-hover:text-slate-600'}
                    `}>
                      {item.icon}
                    </div>
                    
                    {/* Smoothly expanding container for navigation label */}
                    <div className={`transition-all duration-500 overflow-hidden flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-48 opacity-100'}`}>
                      <span className={`text-[16px] tracking-tight whitespace-nowrap leading-none ${isActive ? 'pl-0.5' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile Area */}
      <div className="mt-auto border-t border-slate-50/50 p-4">
        <button 
          onClick={logout}
          className={`
            w-full flex items-center transition-all duration-500 group rounded-[24px] 
            hover:bg-red-50/50 relative overflow-hidden active:scale-95
            ${isCollapsed ? 'justify-center py-4' : 'px-4 py-3'}
          `}
          title={isCollapsed ? "Sign out" : ""}
        >
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black border-2 border-white shadow-sm transition-all duration-500 group-hover:bg-red-100 group-hover:text-red-500 uppercase">
               {user?.name?.[0]}{user?.lname?.[0]}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
 
          {/* User Info */}
          <div className={`flex flex-col text-left transition-all duration-500 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'}`}>
            <span className="text-[14px] font-bold text-slate-800 leading-tight whitespace-nowrap group-hover:text-red-600 transition-colors uppercase tracking-tight">
              {user?.name} {user?.lname}
            </span>
            <span className="text-[11px] text-slate-400 font-bold leading-tight whitespace-nowrap lowercase opacity-60">
              {user?.email}
            </span>
          </div>

          {/* Logout Icon */}
          <div className={`transition-all duration-500 overflow-hidden flex items-center justify-end ${isCollapsed ? 'w-0 opacity-0' : 'w-8 opacity-40 group-hover:opacity-100 group-hover:text-red-500 ml-auto'}`}>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </button>
      </div>
    </aside>
  );
}
