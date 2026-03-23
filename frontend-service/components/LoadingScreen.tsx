"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Synchronizing..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-12 antialiased font-sans">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-[14px] font-bold text-slate-300 tracking-[0.4em] uppercase select-none">
          {message}
        </div>
      </div>
    </div>
  );
}
