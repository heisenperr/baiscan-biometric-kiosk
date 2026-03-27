"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import Image from "next/image";

interface VitalsDisplayProps {
  isActive: boolean;
  onBack: () => void;
}

const STABILIZE_DURATION_MS = 2000;
const STABILIZE_DELAY_MS = 7000; // 7s delay before starting stabilization
const STABILIZE_THRESHOLD_BPM = 3;
const STABILIZE_THRESHOLD_SPO2 = 2;

export default function VitalsDisplay({ isActive, onBack }: VitalsDisplayProps) {
  const [vitals, setVitals] = useState({ bpm: 0, spo2: 0, finger_detected: false });
  const { socket } = useSocket();

  // Capture state
  const [bpmCaptured, setBpmCaptured] = useState(false);
  const [spo2Captured, setSpo2Captured] = useState(false);
  const [capturedBpm, setCapturedBpm] = useState(0);
  const [capturedSpo2, setCapturedSpo2] = useState(0);

  // Stabilization progress (0-100)
  const [bpmProgress, setBpmProgress] = useState(0);
  const [spo2Progress, setSpo2Progress] = useState(0);

  // Stabilization tracking refs
  const fingerDetectedAtRef = useRef<number | null>(null);
  const bpmStableStartRef = useRef<number | null>(null);
  const bpmBaselineRef = useRef<number>(0);
  const spo2StableStartRef = useRef<number | null>(null);
  const spo2BaselineRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  // Socket connection
  useEffect(() => {
    if (!socket) return;

    const handleVitals = (data: any) => {
      if (isActive && data && typeof data === "object" && !Array.isArray(data)) {
        setVitals({
          bpm: typeof data.bpm === "number" ? data.bpm : 0,
          spo2: typeof data.spo2 === "number" ? data.spo2 : 0,
          finger_detected: !!data.finger_detected,
        });
      }
    };

    socket.on("sensor:vitals", handleVitals);

    return () => {
      socket.off("sensor:vitals", handleVitals);
    };
  }, [socket, isActive]);

  // Finger detection timing
  useEffect(() => {
    if (vitals.finger_detected) {
      if (fingerDetectedAtRef.current === null) {
        fingerDetectedAtRef.current = Date.now();
      }
    } else {
      fingerDetectedAtRef.current = null;
      bpmStableStartRef.current = null;
      spo2StableStartRef.current = null;
      setBpmProgress(0);
      setSpo2Progress(0);
    }
  }, [vitals.finger_detected]);

  // BPM stabilization logic
  useEffect(() => {
    if (bpmCaptured || !vitals.finger_detected || vitals.bpm <= 0) {
      if (!bpmCaptured) { bpmStableStartRef.current = null; setBpmProgress(0); }
      return;
    }

    const now = Date.now();

    // Only start stabilizing after the initial delay
    if (fingerDetectedAtRef.current === null || (now - fingerDetectedAtRef.current < STABILIZE_DELAY_MS)) {
      bpmStableStartRef.current = null;
      setBpmProgress(0);
      return;
    }

    if (bpmStableStartRef.current === null) {
      bpmStableStartRef.current = now;
      bpmBaselineRef.current = vitals.bpm;
    } else if (Math.abs(vitals.bpm - bpmBaselineRef.current) > STABILIZE_THRESHOLD_BPM) {
      bpmStableStartRef.current = now;
      bpmBaselineRef.current = vitals.bpm;
      setBpmProgress(0);
    }
  }, [vitals.bpm, vitals.finger_detected, bpmCaptured]);

  // SpO2 stabilization logic
  useEffect(() => {
    if (spo2Captured || !vitals.finger_detected || vitals.spo2 <= 0) {
      if (!spo2Captured) { spo2StableStartRef.current = null; setSpo2Progress(0); }
      return;
    }

    const now = Date.now();

    // Only start stabilizing after the initial delay
    if (fingerDetectedAtRef.current === null || (now - fingerDetectedAtRef.current < STABILIZE_DELAY_MS)) {
      spo2StableStartRef.current = null;
      setSpo2Progress(0);
      return;
    }

    if (spo2StableStartRef.current === null) {
      spo2StableStartRef.current = now;
      spo2BaselineRef.current = vitals.spo2;
    } else if (Math.abs(vitals.spo2 - spo2BaselineRef.current) > STABILIZE_THRESHOLD_SPO2) {
      spo2StableStartRef.current = now;
      spo2BaselineRef.current = vitals.spo2;
      setSpo2Progress(0);
    }
  }, [vitals.spo2, vitals.finger_detected, spo2Captured]);

  // Animation frame for smooth progress bars + capture trigger
  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      if (!bpmCaptured && bpmStableStartRef.current !== null) {
        const elapsed = now - bpmStableStartRef.current;
        const pct = Math.min((elapsed / STABILIZE_DURATION_MS) * 100, 100);
        setBpmProgress(pct);
        if (pct >= 100) {
          setCapturedBpm(vitals.bpm);
          setBpmCaptured(true);
        }
      }

      if (!spo2Captured && spo2StableStartRef.current !== null) {
        const elapsed = now - spo2StableStartRef.current;
        const pct = Math.min((elapsed / STABILIZE_DURATION_MS) * 100, 100);
        setSpo2Progress(pct);
        if (pct >= 100) {
          setCapturedSpo2(vitals.spo2);
          setSpo2Captured(true);
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [bpmCaptured, spo2Captured, vitals.bpm, vitals.spo2]);

  const allCaptured = bpmCaptured && spo2Captured;

  const ringBorder = (captured: boolean, activeGradient: string) => {
    if (captured) return "bg-gradient-to-br from-green-400 to-emerald-600";
    if (vitals.finger_detected) return activeGradient;
    return "bg-slate-100";
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full max-w-2xl mx-auto overflow-hidden relative">
      {/* Mind Blown Icon */}
      {/* Meme Image in Right Top - Adjusted Downward */}
      <div className="absolute top-8 right-0 p-2 z-20 pointer-events-none">
        <Image
          src="/mindblown.jpg"
          alt="Mind Blown"
          width={64}
          height={64}
          className="w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-lg border-2 border-white/50 rotate-3 transition-all hover:scale-110 active:scale-95 pointer-events-auto cursor-help opacity-60 hover:opacity-100 hover:rotate-12"
        />
      </div>

      {/* Two-Panel Layout: Vitals Left | Instructions Right */}
      <div className="relative flex items-center justify-center space-x-10 mt-4">

        {/* Left Panel — Stacked Vitals Rings */}
        <div className="flex flex-col items-center space-y-5 flex-shrink-0">
          {/* BPM Ring */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`
              w-32 h-32 rounded-[2rem] p-1 transition-all duration-700 shadow-xl relative
              ${ringBorder(bpmCaptured, "bg-gradient-to-br from-red-500 to-rose-600")}
            `}>
              <div className="w-full h-full bg-white rounded-[1.8rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                <div className="text-center relative z-10">
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                    {bpmCaptured ? capturedBpm : (vitals.finger_detected && vitals.bpm > 0 ? vitals.bpm : "--")}
                  </span>
                  <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                    {bpmCaptured ? (
                      <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className={`w-1 h-1 bg-red-500 rounded-full ${vitals.finger_detected ? "animate-ping" : ""}`}></span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${bpmCaptured ? "text-green-600" : "text-red-600"}`}>BPM</span>
                  </div>
                </div>
              </div>
            </div>
            {/* BPM Progress Bar */}
            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${bpmCaptured ? "bg-green-500" : "bg-red-400"}`}
                style={{ width: `${bpmCaptured ? 100 : bpmProgress}%` }}
              ></div>
            </div>
          </div>

          {/* SpO2 Ring */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`
              w-32 h-32 rounded-[2rem] p-1 transition-all duration-700 shadow-xl relative
              ${ringBorder(spo2Captured, "bg-gradient-to-br from-blue-500 to-indigo-600")}
            `}>
              <div className="w-full h-full bg-white rounded-[1.8rem] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                <div className="text-center relative z-10">
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                    {spo2Captured ? capturedSpo2 : (vitals.finger_detected && vitals.spo2 > 0 ? vitals.spo2 : "--")}
                  </span>
                  <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                    {spo2Captured ? (
                      <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className={`w-1 h-1 bg-blue-500 rounded-full ${vitals.finger_detected ? "animate-ping" : ""}`}></span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${spo2Captured ? "text-green-600" : "text-blue-600"}`}>SpO2 %</span>
                  </div>
                </div>
              </div>
            </div>
            {/* SpO2 Progress Bar */}
            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${spo2Captured ? "bg-green-500" : "bg-blue-400"}`}
                style={{ width: `${spo2Captured ? 100 : spo2Progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Panel — Title, Status & Next */}
        <div className="text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Vitals Scan</h2>
            <div className="flex items-center space-x-2">
              <div className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${allCaptured ? "bg-green-500 w-full" : vitals.finger_detected ? "bg-blue-500 w-2/3 animate-[shimmer_2s_infinite]" : "bg-slate-200 w-0"}`}></div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full 
              ${allCaptured ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" :
                vitals.finger_detected ? (
                  fingerDetectedAtRef.current && (Date.now() - fingerDetectedAtRef.current < STABILIZE_DELAY_MS) ? "bg-amber-400 animate-pulse" : "bg-blue-500 animate-pulse"
                ) : "bg-slate-300"}`}
            ></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">
              {allCaptured ? "All Vitals Captured" :
                vitals.finger_detected ? (
                  fingerDetectedAtRef.current && (Date.now() - fingerDetectedAtRef.current < STABILIZE_DELAY_MS) ? "Settling..." : "Stabilizing..."
                ) : "Awaiting Finger"}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
            {allCaptured
              ? "Readings locked. Proceed to the next step."
              : "Hold your finger steady until both readings stabilize."}
          </p>

          {/* Next Button — Appears Only When All Captured */}
          {allCaptured && (
            <button
              onClick={onBack}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black uppercase tracking-[0.2em] text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all active:scale-95 animate-in fade-in zoom-in duration-500"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
