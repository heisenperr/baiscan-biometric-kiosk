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
    <main className="flex h-screen flex-col items-center relative bg-slate-50 overflow-hidden py-4 px-6 md:px-12">
      {/* Mesh Gradient Background Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"></div>
      </div>

      {/* Premium Deep Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600"></div>

      {/* Premium Glass Header */}
      <header className="w-full flex-shrink-0 flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-300 ring-4 ring-white">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            BaiScan <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 italic">B.A.I.R</span>
          </h1>
        </div>

        {!activeModule && (
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
              Kiosk Terminal
            </p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none hidden sm:block">
              Precision Biometrics Active
            </p>
          </div>
        )}
      </header>

      <section className="w-full flex-grow flex items-center justify-center overflow-hidden relative z-10">
        {!activeModule ? (
          <Dashboard onSelectModule={setActiveModule} />
        ) : (
          <div className="w-full">
            {activeModule === 'height' && <HeightDisplay isActive={true} onBack={handleBack} />}
          </div>
        )}
      </section>

      {/* Ultra Slim Premium Footer */}
      {!activeModule && (
        <footer className="w-full flex-shrink-0 flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50 relative z-20">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-60">
            &copy; 2026 BaiScan Biometrics • Professional Series
          </p>
          <div className="flex space-x-6 text-[8px] text-slate-500 font-black uppercase tracking-widest">
            <span className="flex items-center space-x-1.5">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
              <span>v0.0.1 Online</span>
            </span>
          </div>
        </footer>
      )}
    </main>
  );
}
