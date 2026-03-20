import React from "react";
import HeightDisplay from "@/components/HeightDisplay";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white overflow-hidden">
      {/* Background decoration for a professional medical look */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
      
      <section className="max-w-4xl w-full text-center space-y-12 relative z-10">
        {/* Subtle hospital icon representation */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center shadow-inner">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M9 12h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900 leading-tight">
            BaiScan <span className="text-blue-600 italic">B.A.I.R.</span>
          </h1>
          <p className="text-sm md:text-base font-bold text-stone-400 uppercase tracking-[0.5em] max-w-2xl mx-auto opacity-70">
            Advanced Intelligent Kiosk Systems
          </p>
        </div>

        {/* Real-time Height Display Integration */}
        <div className="py-8">
          <HeightDisplay />
        </div>
      </section>

      {/* Footer / Copyright */}
      <footer className="absolute bottom-10 w-full text-center px-6">
        <p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.2em]">
          &copy; 2026 BaiScan Professional Series
        </p>
      </footer>
    </main>
  );
}
