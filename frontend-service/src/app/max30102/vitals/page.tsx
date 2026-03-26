"use client";

import React from "react";
import VitalsDisplay from "@/components/VitalsDisplay";
import { useRouter } from "next/navigation";

export default function VitalsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-12">
      <div className="px-6 mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
          Vitals <span className="text-blue-600">Scan</span>
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Professional Biometric Analysis Laboratory
        </p>
      </div>

      <div className="flex-grow flex items-start justify-center pt-8">
        <VitalsDisplay isActive={true} onBack={handleBack} />
      </div>

      <footer className="p-8 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          BaiScan Precision Series • Opto-Biometric Sensor v2.1
        </p>
      </footer>
    </main>
  );
}
