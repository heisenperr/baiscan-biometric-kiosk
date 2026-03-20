"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

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
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 w-full max-w-4xl mx-auto py-4 md:py-10 px-4 md:px-6">
      {/* Massive Back Interaction - Optimized for small screens */}
      <button 
        onClick={onBack}
        className="self-start mb-8 md:mb-16 text-stone-300 hover:text-blue-600 transition-all flex items-center space-x-3 md:space-x-4 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm group active:scale-95"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span>Back to Selection</span>
      </button>

      <div className="relative w-full flex flex-col items-center">
        {/* Massive Circle Display - Responsive Sizing */}
        <div className={`
          w-64 h-64 sm:w-[28rem] sm:h-[28rem] md:w-[32rem] md:h-[32rem] rounded-[3rem] sm:rounded-[6rem] border-4 sm:border-8 transition-all duration-1000 bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center
          ${isActive ? 'border-blue-500' : 'border-stone-100'}
        `}>
          <div className="text-center relative">
            <span className="text-8xl sm:text-[10rem] md:text-[14rem] font-black text-stone-900 tracking-tighter tabular-nums leading-none">
              {height !== null ? Math.round(height) : "--"}
            </span>
            <span className="block text-sm sm:text-xl md:text-2xl font-black text-blue-600 uppercase tracking-[0.5em] mt-1 sm:mt-2 opacity-50">
              mm
            </span>
          </div>
        </div>

        <div className="mt-12 md:mt-20 text-center space-y-2 md:space-y-4">
          <h2 className="text-3xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter leading-none">Scanning Height</h2>
          <p className="text-sm md:text-xl text-stone-300 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] max-w-sm mx-auto">
            Please keep your back straight
          </p>
        </div>
      </div>
    </div>
  );
}
