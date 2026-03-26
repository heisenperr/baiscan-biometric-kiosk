"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";
import {
  getAllCalibrations,
  saveCalibration,
  tareSensor,
  CalibrationRecord,
} from "@/lib/api/calibration";
import PageHeader from "@/components/PageHeader";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeightData {
  sensor: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface CalibrationUpdatedEvent {
  sensor_name: string;
  reference_unit: number;
  offset: number;
  updated_at: string;
}

type Status = "idle" | "saving" | "success" | "error" | "taring";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(date: string) {
  return new Date(date).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CalibrationPanel() {
  // Form state
  const [referenceUnit, setReferenceUnit] = useState<string>("1.0");
  const [offset, setOffset] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");

  // UI state
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [history, setHistory] = useState<CalibrationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Live sensor preview
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ── Load history ─────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const { data } = await getAllCalibrations();
      setHistory(data);
      const hx = data.find((r) => r.sensor_name === "HX711");
      if (hx) {
        setReferenceUnit(String(hx.reference_unit));
        setOffset(String(hx.offset));
        setNotes(hx.notes ?? "");
      }
    } catch {
      // silently ignore on first load
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("sensor:weight", (data: WeightData) => {
      setLiveWeight(data.value);
    });

    socket.on("calibration:updated", (_data: CalibrationUpdatedEvent) => {
      loadHistory();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadHistory]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ru = parseFloat(referenceUnit);
    const off = parseFloat(offset);

    if (!ru || ru === 0) {
      setStatus("error");
      setStatusMsg("Reference unit cannot be zero.");
      return;
    }

    setStatus("saving");
    setStatusMsg("");
    try {
      await saveCalibration({ sensor_name: "HX711", reference_unit: ru, offset: off, notes });
      setStatus("success");
      setStatusMsg("Calibration saved and applied to the sensor.");
      loadHistory();
    } catch {
      setStatus("error");
      setStatusMsg("Failed to save calibration. Check that the sensor service is running.");
    }
  };

  const handleTare = async () => {
    setStatus("taring");
    setStatusMsg("");
    try {
      const { data } = await tareSensor();
      setOffset(String(data.offset));
      setStatus("success");
      setStatusMsg(`Tare complete. New offset: ${data.offset.toFixed(2)}`);
      loadHistory();
    } catch {
      setStatus("error");
      setStatusMsg("Tare failed — sensor may be unavailable.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isBusy = status === "saving" || status === "taring";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sensor Calibration"
        subtitle="Adjust HX711 weight sensor parameters. Changes apply to the live sensor immediately."
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* ── Left: Form ── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Live weight preview card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-3xl font-black text-white tabular-nums leading-none">
                  {liveWeight !== null ? liveWeight.toFixed(1) : "--"}
                </span>
                <span className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mt-0.5">
                  kg
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">
                Live Weight Preview
              </p>
              <h3 className="text-[22px] font-black text-slate-800 leading-tight tracking-tighter">
                {liveWeight !== null
                  ? `${liveWeight.toFixed(3)} kg`
                  : "Awaiting sensor data…"}
              </h3>
              <p className="text-[13px] text-slate-400 font-bold mt-1">
                Reflects the current calibration immediately
              </p>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                <span className="text-[11px] text-blue-500 font-bold uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Calibration form */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-6"
          >
            <div>
              <h2 className="text-[18px] font-black text-slate-800 tracking-tight">
                HX711 Calibration Parameters
              </h2>
              <p className="text-[13px] text-slate-400 font-bold mt-0.5">
                Reference unit = raw ADC units per kilogram
              </p>
            </div>

            {/* Reference Unit */}
            <div className="space-y-2">
              <label className="block text-[13px] font-black text-slate-600 uppercase tracking-[0.12em]">
                Reference Unit
              </label>
              <input
                type="number"
                step="any"
                value={referenceUnit}
                onChange={(e) => setReferenceUnit(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-[16px] font-bold text-slate-800 border-none focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="e.g. 420.5"
              />
              <p className="text-[12px] text-slate-400 font-bold">
                Determine this by placing a known weight and dividing raw ADC output by its mass in kg.
              </p>
            </div>

            {/* Offset */}
            <div className="space-y-2">
              <label className="block text-[13px] font-black text-slate-600 uppercase tracking-[0.12em]">
                Offset (Zero Point)
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  step="any"
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                  required
                  className="flex-grow px-5 py-3.5 bg-slate-50 rounded-2xl text-[16px] font-bold text-slate-800 border-none focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="e.g. 0"
                />
                <button
                  type="button"
                  onClick={handleTare}
                  disabled={isBusy}
                  title="Auto-detect zero with nothing on the scale"
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[13px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0"
                >
                  {status === "taring" ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{status === "taring" ? "Taring…" : "Auto Tare"}</span>
                </button>
              </div>
              <p className="text-[12px] text-slate-400 font-bold">
                Or click <strong>Auto Tare</strong> with the scale empty to auto-detect the zero point.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-[13px] font-black text-slate-600 uppercase tracking-[0.12em]">
                Notes <span className="text-slate-300 font-bold normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-[14px] font-bold text-slate-800 border-none focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                placeholder="e.g. Calibrated with 5 kg reference weight, 2026-03-26"
              />
            </div>

            {/* Status banner */}
            {status !== "idle" && status !== "saving" && status !== "taring" && (
              <div
                className={`rounded-2xl px-5 py-3.5 text-[14px] font-bold flex items-center space-x-3 transition-all ${
                  status === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status === "success" ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
                  </svg>
                )}
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[15px] uppercase tracking-[0.15em] rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {status === "saving" ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Applying…</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save &amp; Apply</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Right: History ── */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 h-full">
            <div className="mb-6">
              <h2 className="text-[18px] font-black text-slate-800 tracking-tight">
                Calibration History
              </h2>
              <p className="text-[13px] text-slate-400 font-bold mt-0.5">
                Most recent saved records
              </p>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-[18px] bg-slate-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-[14px] font-bold text-slate-400">No calibration records yet</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {history.map((rec) => (
                  <div
                    key={rec.id}
                    className="group p-5 rounded-2xl bg-slate-50/60 hover:bg-blue-50/40 border border-transparent hover:border-blue-100/60 transition-all cursor-default"
                    onClick={() => {
                      setReferenceUnit(String(rec.reference_unit));
                      setOffset(String(rec.offset));
                      setNotes(rec.notes ?? "");
                      setStatus("idle");
                    }}
                    title="Click to restore this calibration"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.15em] bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                        {rec.sensor_name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {fmt(rec.updated_at)}
                      </span>
                    </div>
                    <div className="flex space-x-6 text-slate-700">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref. Unit</p>
                        <p className="text-[16px] font-black tabular-nums tracking-tighter">{rec.reference_unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offset</p>
                        <p className="text-[16px] font-black tabular-nums tracking-tighter">{rec.offset}</p>
                      </div>
                    </div>
                    {rec.notes && (
                      <p className="text-[12px] text-slate-400 font-bold mt-2 truncate">{rec.notes}</p>
                    )}
                    <p className="text-[11px] text-slate-300 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to restore →
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
