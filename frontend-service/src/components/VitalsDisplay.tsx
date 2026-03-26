"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";

interface VitalsData {
  bpm: number;
  spo2: number;
  finger_detected: boolean;
  timestamp: string;
}

interface VitalsDisplayProps {
  isActive: boolean;
  onBack: () => void;
}

export default function VitalsDisplay({ isActive, onBack }: VitalsDisplayProps) {
  const [vitals, setVitals] = useState<VitalsData>({
    bpm: 0,
    spo2: 0,
    finger_detected: false,
    timestamp: new Date().toISOString()
  });
  const socketRef = useRef<Socket | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("sensor:vitals", (data: VitalsData) => {
      if (isActive) {
        setVitals(data);
        if (data.bpm > 0) {
          setPulse(true);
          setTimeout(() => setPulse(false), 200);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isActive]);

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start mb-8 text-slate-400 hover:text-blue-600 transition-all flex items-center space-x-2 font-bold uppercase tracking-[0.25em] text-[10px] group active:scale-95"
      >
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all group-hover:border-blue-200 group-hover:shadow-md">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="opacity-60 group-hover:opacity-100">Exit Vitals Module</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Heart Rate Card */}
        <div className={`
          relative overflow-hidden rounded-[3rem] p-8 transition-all duration-700
          ${vitals.finger_detected ? 'bg-white shadow-2xl scale-105' : 'bg-slate-100/50 opacity-50 scale-100'}
        `}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Heart Rate</h3>
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${pulse ? 'bg-red-500 text-white scale-125 shadow-lg shadow-red-200' : 'bg-red-50 text-red-500'}
            `}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-8xl font-black text-slate-900 tabular-nums tracking-tighter">
              {vitals.finger_detected ? vitals.bpm : "--"}
            </span>
            <span className="text-xl font-bold text-red-500 uppercase tracking-widest opacity-60">BPM</span>
          </div>
          
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
            Real-time biometric pulse detection
          </p>
          
          {/* Animated Background Pulse */}
          {pulse && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
          )}
        </div>

        {/* SpO2 Card */}
        <div className={`
          relative overflow-hidden rounded-[3rem] p-8 transition-all duration-700
          ${vitals.finger_detected ? 'bg-white shadow-2xl scale-105' : 'bg-slate-100/50 opacity-50 scale-100'}
        `}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Blood Oxygen</h3>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-8xl font-black text-slate-900 tabular-nums tracking-tighter">
              {vitals.finger_detected ? vitals.spo2 : "--"}
            </span>
            <span className="text-xl font-bold text-blue-500 uppercase tracking-widest opacity-60">%</span>
          </div>
          
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
            Peripheral capillary oxygen saturation
          </p>
        </div>
      </div>

      {/* Connection/Status Bar */}
      <div className="mt-12 w-full max-w-md bg-white/40 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${vitals.finger_detected ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
              {vitals.finger_detected ? 'Sensor Active: Finger Detected' : 'Waiting for sensor placement...'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Quality Index</span>
            <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-500 ${vitals.finger_detected ? 'bg-blue-500 w-full' : 'w-0'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
