import React from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      {/* Background decoration for a professional medical look */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
      
      <section className="max-w-4xl w-full text-center animate-fade-in space-y-8">
        {/* Subtle hospital icon representation (simplified for minimalism) */}
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm">
            BaiScan: <span className="text-blue-600 font-black">B.A.I.R.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-stone-500 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
            BaiScan Advanced Intelligent Raspberry Kiosk
          </p>
        </div>

        {/* Minimalist divider */}
        <div className="flex justify-center py-6">
          <div className="w-12 h-1 bg-stone-100 rounded-full"></div>
        </div>

        {/* Optional Action Button (Call to Engagement) */}
        <div className="pt-4">
          <button className="px-10 py-4 bg-stone-900 text-white rounded-xl font-semibold shadow-xl shadow-stone-200 hover:bg-stone-800 transition-all active:scale-95">
            Get Started
          </button>
        </div>
      </section>

      {/* Footer / Copyright - Keeping it clinical */}
      <footer className="absolute bottom-10 w-full text-center px-6">
        <p className="text-sm text-stone-400 font-medium">
          Professional Health Solutions &copy; 2026 BaiScan Systems
        </p>
      </footer>
    </main>
  );
}

