"use client";

import React from "react";

interface ModuleCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  isReady: boolean;
}

interface DashboardProps {
  onSelectModule: (id: string) => void;
}

export default function Dashboard({ onSelectModule }: DashboardProps) {
  const modules: ModuleCard[] = [
    {
      id: "height",
      name: "Height",
      isReady: true,
      icon: (
        <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
    {
      id: "weight",
      name: "Weight",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      id: "heart",
      name: "Heart",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "oxygen",
      name: "Oxygen",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: "temp",
      name: "Temp",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 py-2">
      <div className="flex flex-wrap justify-center gap-4">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => module.isReady && onSelectModule(module.id)}
            disabled={!module.isReady}
            className={`
              relative group p-4 md:p-6 rounded-[2rem] border transition-all duration-500 text-left w-36 md:w-44
              ${module.isReady 
                ? 'border-white bg-white/60 backdrop-blur-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:bg-white hover:border-blue-400 hover:shadow-[0_25px_50px_-15px_rgba(59,130,246,0.15)] cursor-pointer active:scale-95' 
                : 'border-slate-100 bg-slate-100/30 cursor-not-allowed opacity-30 shadow-none'
              }
            `}
          >
            {/* Gloss Header Effect */}
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] pointer-events-none`}></div>

            <div className={`
              relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500
              ${module.isReady 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 group-hover:rotate-6 group-hover:scale-110' 
                : 'bg-slate-200 text-slate-400'
              }
            `}>
              {module.icon}
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className={`text-md md:text-xl font-black tracking-tight ${module.isReady ? 'text-slate-900 leading-none' : 'text-slate-400'}`}>
                {module.name}
              </h3>
              <div className="flex items-center space-x-1">
                 <div className={`w-1 h-1 rounded-full ${module.isReady ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                 <p className={`text-[8px] font-black uppercase tracking-widest ${module.isReady ? 'text-blue-600' : 'text-slate-300'}`}>
                   {module.isReady ? "Ready" : "Offline"}
                 </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
