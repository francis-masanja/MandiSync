'use client';

import React, { useState } from 'react';
import { Booking, TelemetryLog } from '@/lib/types';
import { hardwareAudio } from '@/lib/audio';
import {
  Scale,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Truck,
  Droplets,
  Radio,
  FileCheck
} from 'lucide-react';

interface HardwareBenchProps {
  bookings?: Booking[];
  logs?: TelemetryLog[];
  onRefreshData?: () => void;
}

export function HardwareBench({ bookings = [], logs = [], onRefreshData }: HardwareBenchProps) {
  const [activeBookingId, setActiveBookingId] = useState<string>(
    bookings.find((b) => b.status === 'GATE_VERIFIED')?.id || bookings[0]?.id || ''
  );
  const [scaleMode, setScaleMode] = useState<'GROSS' | 'TARE'>('GROSS');
  const [weightInput, setWeightInput] = useState<number>(6450);
  const [moistureInput, setMoistureInput] = useState<number>(11.8);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);
  const [bufferedCount, setBufferedCount] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const selectedBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  const handleCaptureWeight = async () => {
    setIsRecording(true);
    setResultMessage(null);

    hardwareAudio.playScaleChime();

    if (!isNetworkOnline) {
      setTimeout(() => {
        setBufferedCount((prev) => prev + 1);
        setIsRecording(false);
        setResultMessage(
          `Offline Network detected: Saved to ESP32 LittleFS flash buffer (/spiffs/scale_${Date.now()}.json). Will sync when WiFi reconnects.`
        );
      }, 700);
      return;
    }

    try {
      const res = await fetch('/api/v1/telemetry/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking?.id,
          rfidTag: selectedBooking?.rfidTag,
          weightKg: weightInput,
          measurementType: scaleMode,
          moisturePercentage: moistureInput,
          deviceId: 'ESP32-WEIGH-BRIDGE-01',
          source: 'LIVE_SENSOR_ADC',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record weight');
      }

      setResultMessage(
        `${scaleMode} weight (${weightInput} kg) recorded into procurement ledger.`
      );
      onRefreshData?.();
    } catch (err: any) {
      setResultMessage(err.message || 'Weighbridge communication failed');
    } finally {
      setIsRecording(false);
    }
  };

  const handleSyncOfflineBuffer = async () => {
    if (bufferedCount === 0) return;
    setIsRecording(true);
    try {
      await fetch('/api/v1/telemetry/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking?.id,
          rfidTag: selectedBooking?.rfidTag,
          weightKg: weightInput,
          measurementType: scaleMode,
          moisturePercentage: moistureInput,
          deviceId: 'ESP32-WEIGH-BRIDGE-01',
          source: 'LITTLEFS_BUFFER',
        }),
      });
      setBufferedCount(0);
      setResultMessage('All offline LittleFS queue records synchronized to central database.');
      onRefreshData?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecording(false);
    }
  };

  const weighLogs = logs.filter((l) => l.type === 'HX711_ADC' || l.type === 'LITTLEFS_BUFFER');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-glass border-glass rounded-glassy">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                HX711 24-Bit ADC + LittleFS Buffer
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                Weighbridge Digital Sensor Bench
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsNetworkOnline(!isNetworkOnline)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer ${
                isNetworkOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
              }`}
            >
              {isNetworkOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isNetworkOnline ? 'WiFi: Connected' : 'Simulate Offline Mode'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Active Truck in Weighbridge Bay
              </label>
              <select
                value={activeBookingId}
                onChange={(e) => setActiveBookingId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.vehicleNumber} — {b.farmerName} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Measurement Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScaleMode('GROSS');
                    setWeightInput(6450);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    scaleMode === 'GROSS'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-secondaryClay border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Gross (Laden)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScaleMode('TARE');
                    setWeightInput(3950);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    scaleMode === 'TARE'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-secondaryClay border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tare (Empty)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl text-center text-white relative overflow-hidden">
            <div className="text-xs font-mono text-slate-400 mb-1">
              DIGITAL LOAD-CELL TELEMETRY (HX711 24-BIT Σ-Δ ADC)
            </div>
            <div className="text-5xl font-black font-mono tracking-tight text-emerald-400 my-2">
              {weightInput.toLocaleString()} <span className="text-2xl text-emerald-600">KG</span>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center justify-center gap-4">
              <span>STABLE: 99.8%</span>
              <span>EXCITATION: 5.0V</span>
              <span>CALIBRATION FACTOR: 21.44</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondaryClay p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Simulate Scale Weight Value (kg)
              </label>
              <input
                type="number"
                step="50"
                value={weightInput}
                onChange={(e) => setWeightInput(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                Grain Moisture Sensor (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={moistureInput}
                onChange={(e) => setMoistureInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isRecording}
              onClick={handleCaptureWeight}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRecording ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
              Capture {scaleMode} Weight from Scale
            </button>

            {bufferedCount > 0 && isNetworkOnline && (
              <button
                type="button"
                onClick={handleSyncOfflineBuffer}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Database className="w-3.5 h-3.5" />
                Flush LittleFS Buffer ({bufferedCount} offline records)
              </button>
            )}
          </div>

          {resultMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-glass border-glass rounded-glassy shadow-glassy space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              HX711 Telemetry & LittleFS Sync Logs
            </h3>
            <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              ADC RATE 80Hz
            </span>
          </div>

          <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] h-96 overflow-y-auto space-y-1.5">
            {weighLogs.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">No scale telemetry captured yet.</div>
            ) : (
              weighLogs.map((log) => (
                <div key={log.id} className="leading-relaxed border-b border-slate-900 pb-1">
                  <span className="text-slate-500">[{log.createdAt.toISOString().split('T')[1].slice(0, 8)}]</span>{' '}
                  <span
                    className={
                      log.type === 'HX711_ADC'
                        ? 'text-emerald-400 font-bold'
                        : log.type === 'LITTLEFS_BUFFER'
                        ? 'text-amber-400 font-bold'
                        : 'text-rose-400'
                    }
                  >
                    [{log.type}]
                  </span>{' '}
                  <span className="text-slate-300 font-semibold">Event:</span>{' '}
                  <span className="text-slate-400">{JSON.stringify(log)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
