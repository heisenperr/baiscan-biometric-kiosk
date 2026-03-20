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
        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
    {
      id: "weight",
      name: "Weight",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      id: "heart",
      name: "Heart Rate",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "oxygen",
      name: "Oxygen",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: "temp",
      name: "Temperature",
      isReady: false,
      icon: (
        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-8 py-4 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => module.isReady && onSelectModule(module.id)}
            disabled={!module.isReady}
            className={`
              relative group p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all duration-700 text-left
              ${module.isReady 
                ? 'border-blue-50 bg-white hover:border-blue-500 hover:shadow-[0_40px_80px_-15px_rgba(59,130,246,0.15)] cursor-pointer active:scale-95' 
                : 'border-stone-50 bg-stone-50/50 cursor-not-allowed opacity-40'
              }
            `}
          >
            <div className={`
              w-16 h-16 md:w-24 md:h-24 rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-10 transition-all duration-700
              ${module.isReady 
                ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6' 
                : 'bg-stone-100 text-stone-300'
              }
            `}>
              {module.icon}
            </div>

            <div className="space-y-1 md:space-y-3">
              <h3 className={`text-2xl md:text-4xl font-black tracking-tighter ${module.isReady ? 'text-stone-900 leading-none' : 'text-stone-400'}`}>
                {module.name}
              </h3>
              <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] ${module.isReady ? 'text-blue-500' : 'text-stone-300'}`}>
                {module.isReady ? "Tap to Start" : "Coming Soon"}
              </p>
            </div>

            {module.isReady && (
              <div className="absolute top-6 right-6 md:top-12 md:right-12 text-blue-100 group-hover:text-blue-500 transition-colors">
                <svg className="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
