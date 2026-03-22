"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface HeightData {
  sensor: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface HeightDisplayProps {
  isActive: boolean;
  onBack: () => void;
}

export default function HeightDisplay({ isActive, onBack }: HeightDisplayProps) {
  const [height, setHeight] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
      `http://${window.location.hostname}:3001`;

    console.log(`[SOCKET] Connecting to backend at: ${backendUrl}`);

    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("sensor:height", (data: HeightData) => {
      if (isActiveRef.current) {
        setHeight(data.value);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

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

      {/* Compact Back Button - High End Style */}
      <button
        onClick={onBack}
        className="self-start mb-4 text-slate-400 hover:text-blue-600 transition-all flex items-center space-x-2 font-black uppercase tracking-[0.2em] text-[10px] group active:scale-95"
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all group-hover:border-blue-200 group-hover:shadow-md">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="opacity-60 group-hover:opacity-100">Cancel Scan</span>
      </button>

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
              <span className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                {height !== null ? Math.round(height) : "--"}
              </span>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-sm font-black text-blue-600 uppercase tracking-widest opacity-70">
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
        </div>
      </div>
    </div>
  );
}
