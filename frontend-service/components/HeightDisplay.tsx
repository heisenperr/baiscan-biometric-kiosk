"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface HeightData {
  sensor: string;
  value: number;
  unit: string;
  timestamp: string;
}

export default function HeightDisplay() {
  const [height, setHeight] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  useEffect(() => {
    // Connect to the Node.js backend
    const socket: Socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
      setIsConnected(false);
    });

    socket.on("sensor:height", (data: HeightData) => {
      if (isMeasuring) {
        setHeight(data.value);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isMeasuring]);

  const toggleMeasurement = () => {
    setIsMeasuring(!isMeasuring);
    if (!isMeasuring) setHeight(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative group">
        <div className={`w-64 h-64 rounded-full border-4 ${isMeasuring ? 'border-blue-500 animate-pulse' : 'border-stone-100'} flex flex-col items-center justify-center transition-all duration-500 bg-white shadow-2xl overflow-hidden`}>
          {isMeasuring ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <span className="text-6xl font-black text-blue-600">
                {height !== null ? height : "--"}
              </span>
              <span className="block text-sm font-bold text-stone-400 uppercase tracking-widest mt-2">
                Millimeters
              </span>
            </div>
          ) : (
            <div className="text-center text-stone-300 group-hover:text-stone-400 transition-colors">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-xs uppercase tracking-[0.3em] font-bold">Ready</span>
            </div>
          )}
          
          {/* Connection Status Indicator */}
          <div className="absolute bottom-6 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-stone-400">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={toggleMeasurement}
        className={`px-12 py-5 rounded-2xl font-black uppercase tracking-[0.1em] transition-all transform active:scale-95 shadow-2xl ${
          isMeasuring 
            ? 'bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100' 
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'
        }`}
      >
        {isMeasuring ? "Stop Session" : "Get Height"}
      </button>

      {isMeasuring && (
        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest animate-pulse">
          Streaming data from VL53L1X...
        </p>
      )}
    </div>
  );
}
