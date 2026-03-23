"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <PageHeader 
        title="Welcome to Dashboard" 
        subtitle="Under Construction Page"
      />

      {/* Placeholder for future stats/content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50"></div>
            <div className="h-4 w-32 bg-slate-50 rounded-lg"></div>
            <div className="h-8 w-24 bg-slate-50 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main empty state area */}
      <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm p-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center text-blue-600">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-[24px] font-bold text-slate-800">New features coming soon</h2>
          <p className="text-[16px] text-slate-400 font-bold max-w-md mx-auto">
            We are working hard to bring you the best biometric management experience. Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
