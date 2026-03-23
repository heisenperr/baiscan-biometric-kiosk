"use client";

import React from "react";
import PageHeader from "../../../../components/PageHeader";

export default function NotificationPage() {
  return (
    <div className="space-y-10">
      <PageHeader 
        title="Notifications" 
        subtitle="Manage system alerts and user communications"
      />

      {/* Under Construction Empty State */}
      <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm p-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center text-blue-600">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-[24px] font-bold text-slate-800">Notification system under construction</h2>
          <p className="text-[16px] text-slate-400 font-bold max-w-md mx-auto">
            This module will allow you to configure real-time alerts and manage kiosk notifications. We are working to bring this to you soon.
          </p>
        </div>
      </div>
    </div>
  );
}
