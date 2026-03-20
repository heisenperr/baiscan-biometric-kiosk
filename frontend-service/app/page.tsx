"use client";

import React, { useState } from "react";
import HeightDisplay from "@/components/HeightDisplay";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const handleBack = () => {
    setActiveModule(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center relative bg-white overflow-x-hidden pt-12 md:pt-32 pb-12 md:pb-32">
      {/* Premium Medical Accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      
      {/* Massive Branded Header */}
      <header className="w-full max-w-7xl px-6 md:px-12 flex flex-col items-center mb-12 md:mb-24 space-y-4 md:space-y-8 text-center">
        <div className="relative flex flex-col md:flex-row items-center md:space-x-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 mb-4 md:mb-0">
             <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-stone-900 uppercase leading-none">
             BaiScan <span className="text-blue-600/20 italic">B.A.I.R</span>
          </h1>
        </div>
        {!activeModule && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <p className="text-stone-400 font-black uppercase tracking-[0.2em] md:tracking-[0.8em] text-[10px] md:text-xs">
              Biometric Intelligent Architecture
            </p>
            <h2 className="text-[10px] md:text-[14px] font-bold text-stone-300 uppercase tracking-widest leading-relaxed px-4">
              Development of BAISCAN Station: Intelligent Biometric Kiosk with Multi-Sensor Health Monitoring, AI, and Raspberry Pi
            </h2>
          </div>
        )}
      </header>
      
      <section className="w-full flex-grow flex items-center justify-center relative z-10 px-4 md:px-8">
        {!activeModule ? (
           <Dashboard onSelectModule={setActiveModule} />
        ) : (
          <div className="w-full">
            {activeModule === 'height' && <HeightDisplay isActive={true} onBack={handleBack} />}
          </div>
        )}
      </section>

      {/* Modern Minimalist Footer */}
      {!activeModule && (
        <footer className="w-full max-w-7xl px-6 md:px-12 flex flex-col md:flex-row justify-between items-center mt-12 md:mt-32 pt-10 md:pt-16 border-t border-stone-50 space-y-4 md:space-y-0">
          <p className="text-[10px] md:text-xs text-stone-200 font-black uppercase tracking-[0.4em] text-center md:text-left">
            &copy; 2026 BaiScan Professional Series
          </p>
          <div className="flex space-x-6 md:space-x-12 text-[10px] md:text-xs text-stone-100 font-black uppercase tracking-widest">
            <span>Terminal V1.0.42</span>
            <span className="hidden sm:inline">Standard Protocol Active</span>
          </div>
        </footer>
      )}
    </main>
  );
}
