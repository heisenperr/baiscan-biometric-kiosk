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
      {/* Mind Blown Icon - Project Signature */}
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
        className="self-start mb-6 text-slate-400 hover:text-blue-600 transition-all flex items-center space-x-2 font-bold uppercase tracking-[0.25em] text-[10px] group active:scale-95 px-4"
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all group-hover:border-blue-200 group-hover:shadow-md">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="opacity-60 group-hover:opacity-100">Cancel Scan</span>
      </button>

      {/* Main Content Area - Vertical for 7-inch Narrow Display */}
      <div className="flex flex-col items-center space-y-8 w-full p-4 pb-12">
        
        {/* Heart Rate Section */}
        <div className="relative flex items-center justify-center space-x-8 w-full">
          <div className={`
            w-44 h-44 rounded-[2.5rem] p-1.5 transition-all duration-700 bg-white shadow-2xl relative
            ${vitals.finger_detected ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-slate-100'}
          `}>
            <div className="w-full h-full bg-white rounded-[2.3rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
              <div className="text-center relative z-10 transition-transform duration-300">
                <span className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {vitals.finger_detected && vitals.bpm > 0 ? vitals.bpm : "--"}
                </span>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className={`w-1.5 h-1.5 bg-red-500 rounded-full ${vitals.finger_detected ? 'animate-ping' : ''}`}></span>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest opacity-80">BPM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-left w-32">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Pulse Rate</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 leading-relaxed">Automatic heart sensor active.</p>
          </div>
        </div>

        {/* SpO2 Section */}
        <div className="relative flex items-center justify-center space-x-8 w-full">
          <div className={`
            w-44 h-44 rounded-[2.5rem] p-1.5 transition-all duration-700 bg-white shadow-2xl relative
            ${vitals.finger_detected ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-100'}
          `}>
            <div className="w-full h-full bg-white rounded-[2.3rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
              <div className="text-center relative z-10 transition-transform duration-300">
                <span className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {vitals.finger_detected && vitals.spo2 > 0 ? vitals.spo2 : "--"}
                </span>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className={`w-1.5 h-1.5 bg-blue-500 rounded-full ${vitals.finger_detected ? 'animate-ping' : ''}`}></span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest opacity-80">% SpO2</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-left w-32">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Oxygen</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 leading-relaxed">Real-time SPO2 measurement.</p>
          </div>
        </div>

        {/* Status Prompt */}
        <div className="mt-4 text-center">
            <div className={`
                inline-flex items-center space-x-3 px-6 py-3 rounded-2xl border transition-all duration-500
                ${vitals.finger_detected ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}
            `}>
                <div className={`w-2.5 h-2.5 rounded-full ${vitals.finger_detected ? 'bg-green-500 animate-pulse' : 'bg-slate-300 animate-bounce'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {vitals.finger_detected ? "Scanning Vitals..." : "Place Finger on Sensor"}
                </span>
            </div>
        </div>

      </div>
    </div>
  );
}
