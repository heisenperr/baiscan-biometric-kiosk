"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { SOCKET_URL } from "@/lib/api";

interface VitalsDisplayProps {
  isActive: boolean;
  onBack: () => void;
}

export default function VitalsDisplay({ isActive, onBack }: VitalsDisplayProps) {
  const [vitals, setVitals] = useState({
    bpm: 0,
    spo2: 0,
    finger_detected: false,
  });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("sensor:vitals", (data: any) => {
      if (isActive && data && typeof data === 'object' && !Array.isArray(data)) {
        setVitals({
          bpm: typeof data.bpm === 'number' ? data.bpm : 0,
          spo2: typeof data.spo2 === 'number' ? data.spo2 : 0,
          finger_detected: !!data.finger_detected,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isActive]);

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full max-w-2xl mx-auto overflow-hidden relative">
      {/* Mind Blown Icon */}
      <div className="absolute top-0 right-0 p-2 z-20 pointer-events-none">
        <Image
          src="/mindblown.jpg"
          alt="Mind Blown"
          width={64}
          height={64}
          className="w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-lg border-2 border-white/50 rotate-3 transition-all hover:scale-110 active:scale-95 pointer-events-auto cursor-help opacity-60 hover:opacity-100 hover:rotate-12"
        />
      </div>

      {/* Standard Back Button */}
      <button
        onClick={onBack}
        className="self-start mb-4 text-slate-400 hover:text-blue-600 transition-all flex items-center space-x-2 font-bold uppercase tracking-[0.25em] text-[10px] group active:scale-95"
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all group-hover:border-blue-200 group-hover:shadow-md">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="opacity-60 group-hover:opacity-100">Cancel Scan</span>
      </button>

      {/* Two-Panel Layout: Vitals Left | Instructions Right */}
      <div className="relative flex items-center justify-center space-x-10">
        
        {/* Left Panel — Stacked Vitals Rings */}
        <div className="flex flex-col items-center space-y-5 flex-shrink-0">
          {/* BPM Ring */}
          <div className={`
            w-32 h-32 rounded-[2rem] p-1 transition-all duration-700 shadow-xl relative
            ${vitals.finger_detected ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-slate-100'}
          `}>
            <div className="w-full h-full bg-white rounded-[1.8rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
              <div className="text-center relative z-10">
                <span className="text-3xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {vitals.finger_detected && vitals.bpm > 0 ? vitals.bpm : "--"}
                </span>
                <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                  <span className={`w-1 h-1 bg-red-500 rounded-full ${vitals.finger_detected ? 'animate-ping' : ''}`}></span>
                  <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">BPM</span>
                </div>
              </div>
            </div>
          </div>

          {/* SpO2 Ring */}
          <div className={`
            w-32 h-32 rounded-[2rem] p-1 transition-all duration-700 shadow-xl relative
            ${vitals.finger_detected ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-100'}
          `}>
            <div className="w-full h-full bg-white rounded-[1.8rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
              <div className="text-center relative z-10">
                <span className="text-3xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {vitals.finger_detected && vitals.spo2 > 0 ? vitals.spo2 : "--"}
                </span>
                <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                  <span className={`w-1 h-1 bg-blue-500 rounded-full ${vitals.finger_detected ? 'animate-ping' : ''}`}></span>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">SpO2 %</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Title & Instructions */}
        <div className="text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Vitals Scan</h2>
            <div className="flex items-center space-x-2">
              <div className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full w-2/3 transition-all duration-1000 ${vitals.finger_detected ? 'bg-green-500 animate-[shimmer_2s_infinite]' : 'bg-slate-200'}`}></div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${vitals.finger_detected ? 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">
              {vitals.finger_detected ? "Finger Detected" : "Awaiting Finger"}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
            Place your finger on the sensor and keep still for accurate readings.
          </p>
        </div>
      </div>
    </div>
  );
}
