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
    <main className="min-h-screen bg-slate-50 flex flex-col pt-6 overflow-hidden">
      <div className="px-5 mb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          Vitals <span className="text-blue-600">Scan</span>
        </h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
          Professional Biometric Laboratory
        </p>
      </div>

      <div className="flex-grow flex items-start justify-center">
        <VitalsDisplay isActive={true} onBack={handleBack} />
      </div>

      <footer className="p-4 text-center">
        <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.3em] opacity-40">
          v2.1 Precision Series
        </p>
      </footer>
    </main>
  );
}
