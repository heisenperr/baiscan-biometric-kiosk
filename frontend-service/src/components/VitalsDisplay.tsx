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
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("sensor:vitals", (data: any) => {
      // Defensive check to ensure data is an object and has required fields
      if (isActive && data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.finger_detected) {
            console.log("[DEBUG] UI - Received vitals:", data);
        }
        setVitals({
          bpm: typeof data.bpm === 'number' ? data.bpm : 0,
          spo2: typeof data.spo2 === 'number' ? data.spo2 : 0,
          finger_detected: !!data.finger_detected,
          timestamp: data.timestamp || new Date().toISOString()
        });
        
        if (typeof data.bpm === 'number' && data.bpm > 0) {
          setPulse(true);
          if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
          pulseTimeoutRef.current = setTimeout(() => setPulse(false), 200);
        }
      }
    });

    return () => {
      socket.disconnect();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [isActive]);

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full max-w-[400px] mx-auto p-4 select-none space-y-4">
      {/* Compact Back Button */}
      <button
        onClick={onBack}
        className="self-start mb-2 text-slate-400 hover:text-blue-600 transition-all flex items-center space-x-2 font-bold uppercase tracking-[0.25em] text-[10px] group active:scale-95"
      >
        <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all group-hover:border-blue-200">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="opacity-60 group-hover:opacity-100 uppercase tracking-[0.2em] text-[8px]">Exit Module</span>
      </button>

      {/* Vertical Stack for 400px width */}
      <div className="flex flex-col space-y-4 w-full">
        {/* Heart Rate Card */}
        <div className={`
          relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-700 border
          ${vitals.finger_detected 
            ? 'bg-white border-white shadow-[0_20px_40px_-15px_rgba(239,68,68,0.12)] scale-100' 
            : 'bg-slate-100/50 border-slate-100 opacity-50 shadow-none'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Heart Rate</h3>
            <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
              ${pulse ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200' : 'bg-red-50 text-red-500'}
            `}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">
              {vitals.finger_detected ? (vitals.bpm || "--") : "--"}
            </span>
            <span className="text-sm font-bold text-red-500 uppercase tracking-widest opacity-60">BPM</span>
          </div>
          
          {/* Animated Background Pulse */}
          {pulse && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
          )}
        </div>

        {/* SpO2 Card */}
        <div className={`
          relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-700 border
          ${vitals.finger_detected 
            ? 'bg-white border-white shadow-[0_20px_40px_-15px_rgba(59,130,246,0.12)] scale-100' 
            : 'bg-slate-100/50 border-slate-100 opacity-50 shadow-none'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Blood Oxygen</h3>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">
              {vitals.finger_detected ? (vitals.spo2 || "--") : "--"}
            </span>
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest opacity-60">%</span>
          </div>
        </div>
      </div>

      {/* Connection/Status Bar - Compact */}
      <div className="mt-4 w-full bg-white/40 backdrop-blur-md border border-white p-4 rounded-[1.5rem] shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${vitals.finger_detected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></div>
            <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em]">
              {vitals.finger_detected ? 'Finger Detected' : 'Sensor Ready'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.1em]">Signal Quality</span>
            <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-500 ${vitals.finger_detected ? 'bg-blue-500 w-full' : 'w-0'}`}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Design Branding */}
      <div className="pt-2">
        <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.5em] text-center opacity-60">
          BaiScan Precision Series
        </p>
      </div>
    </div>
  );
}
