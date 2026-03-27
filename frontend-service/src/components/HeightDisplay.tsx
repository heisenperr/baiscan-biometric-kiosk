"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import Image from "next/image";

interface HeightData {
  sensor: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface HeightDisplayProps {
  isActive: boolean;
  onNext: () => void;
}

export default function HeightDisplay({ isActive, onNext }: HeightDisplayProps) {
  const [height, setHeight] = useState<number | null>(null);
  const { socket } = useSocket();
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!socket) return;

    const handleHeight = (data: HeightData) => {
      if (isActiveRef.current) {
        setHeight(data.value);
      }
    };

    socket.on(process.env.NEXT_PUBLIC_SENSOR_EVENT_NAME || "sensor:height", handleHeight);

    return () => {
      socket.off(process.env.NEXT_PUBLIC_SENSOR_EVENT_NAME || "sensor:height", handleHeight);
    };
  }, [socket]);

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full max-w-2xl mx-auto overflow-hidden relative">
      {/* Meme Image in Right Top */}
      <div className="absolute top-0 right-0 p-2 z-20 pointer-events-none">
        <Image
          src="/mindblown.jpg"
          alt="Mind Blown"
          width={64}
          height={64}
          className="w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-lg border-2 border-white/50 rotate-3 transition-all hover:scale-110 active:scale-95 pointer-events-auto cursor-help opacity-60 hover:opacity-100 hover:rotate-12"
        />
      </div>



      <div className="relative flex items-center justify-center space-x-16">
        {/* Premium Measurement Ring */}
        <div className={`
          w-56 h-56 md:w-64 md:h-64 rounded-[3.5rem] p-1.5 transition-all duration-700 bg-white shadow-2xl relative
          ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-100'}
        `}>
          <div className="w-full h-full bg-white rounded-[3.2rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {/* Dynamic Shine Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>

            <div className="text-center relative z-10">
              <span className="text-7xl md:text-8xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                {height !== null ? Math.round(height) : "--"}
              </span>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest opacity-80">
                  mm
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Height Scan</h2>
            <div className="flex items-center space-x-2">
              <div className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
            Automatic Sensor detection active. Please stand straight and stay still.
          </p>

          {/* Next Button — Always Visible */}
          <button
            onClick={onNext}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 animate-in fade-in zoom-in duration-500"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
