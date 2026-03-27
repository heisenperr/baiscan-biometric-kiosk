"use client";

import React from "react";
import { useRouter } from "next/navigation";
import WeightDisplay from "@/components/WeightDisplay";

export default function WeightPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="flex h-screen flex-col items-center relative bg-slate-50 overflow-hidden py-4 px-6 md:px-12">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600"></div>

      <header className="w-full flex-shrink-0 flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 transition-transform duration-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 uppercase leading-relaxed">
              BAI<span className="text-blue-600">SCAN</span> <span className="inline-block px-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold italic">B.A.I.R</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-300 tracking-[0.3em] uppercase whitespace-nowrap leading-none mt-1">
              Biometric Kiosk
            </p>
          </div>
        </div>
      </header>

      <section className="w-full flex-grow flex items-center justify-center overflow-hidden relative z-10">
        <div className="w-full">
          <WeightDisplay isActive={true} onNext={handleBack} />
        </div>
      </section>
    </main>
  );
}
