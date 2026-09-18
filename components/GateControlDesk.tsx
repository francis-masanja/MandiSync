'use client';

import React, { useState } from 'react';
import { Booking, TelemetryLog } from '@/lib/types';
import { hardwareAudio } from '@/lib/audio';
import {
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ShieldAlert,
  HardDrive,
  Truck,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';

interface GateControlDeskProps {
  bookings: Booking[];
  logs: TelemetryLog[];
  onRefreshData: () => void;
}

export function GateControlDesk({ bookings, logs, onRefreshData }: GateControlDeskProps) {
  const [rfidInput, setRfidInput] = useState('UHF-TAG-891024');
  const [isVerifying, setIsVerifying] = useState(false);
  const [gateStatus, setGateStatus] = useState<'IDLE' | 'OPEN' | 'DENIED'>('IDLE');
  const [gateAngle, setGateAngle] = useState(0);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleSimulateScan = async (tagToScan: string) => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/v1/telemetry/gate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid_tag: tagToScan,
          device_id: 'ESP32-GATE-DESK-01',
        }),
      });

      const data = await res.json();
      setVerifyResult(data);

      if (data.gate_open) {
        hardwareAudio.playBuzzerSuccess();
        hardwareAudio.playRelayClick();
        setGateStatus('OPEN');
        setGateAngle(90);

        setTimeout(() => {
          setGateAngle(0);
          setGateStatus('IDLE');
        }, 8000);
      } else {
        hardwareAudio.playBuzzerError();
        setGateStatus('DENIED');
        setTimeout(() => {
          setGateStatus('IDLE');
        }, 4000);
      }

      onRefreshData();
    } catch (err) {
      console.error(err);
      hardwareAudio.playBuzzerError();
      setGateStatus('DENIED');
    } finally {
      setIsVerifying(false);
    }
  };

  const gateLogs = logs.filter(
    (l) => l.sensor_type === 'RFID_UHF' || l.sensor_type === 'SERVO_BARRIER'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                UHF RFID Reader & Boom Barrier
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                Physical Gate Authentication Node
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  gateStatus === 'OPEN'
                    ? 'bg-emerald-500 animate-ping'
                    : gateStatus === 'DENIED'
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-mono font-medium text-slate-600">
                {gateStatus === 'OPEN'
                  ? 'BARRIER: OPEN (90°)'
                  : gateStatus === 'DENIED'
                  ? 'ACCESS DENIED'
                  : 'READY: MONITORING'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-6">
              <span>SERVO PIN 18 • RELAY CH1</span>
              <span>UHF ANTENNA: 865-867 MHz (EPC Gen2)</span>
            </div>

            <div className="w-64 h-36 flex flex-col items-center justify-end relative">
              <div className="w-10 h-28 bg-slate-700 rounded-t-lg border-2 border-slate-600 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                SERVO
              </div>

              <div
                className="absolute bottom-6 left-1/2 w-48 h-3.5 bg-stripes-warning rounded-r-md origin-left transition-transform duration-700 shadow-lg flex items-center justify-end px-2"
                style={{
                  transform: `rotate(-${gateAngle}deg)`,
                  background:
                    'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px)',
                }}
              >
                <span className="text-[9px] font-black bg-black/80 px-1 rounded text-amber-400 font-mono">
                  {gateAngle}°
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs font-mono text-center">
              {gateStatus === 'OPEN' && (
                <div className="text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  BARRIER RAISED — VEHICLE CLEARANCE GRANTED
                </div>
              )}
              {gateStatus === 'DENIED' && (
                <div className="text-rose-400 font-bold flex items-center justify-center gap-1.5 animate-bounce">
                  <XCircle className="w-4 h-4" />
                  NO VALID APMC SLOT — ACCESS REJECTED
                </div>
              )}
              {gateStatus === 'IDLE' && (
                <div className="text-slate-400">WAITING FOR RFID / NFC VEHICLE TRANSPONDER</div>
              )}
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-800">
              Simulate UHF Tag Detection via ESP32 Hardware:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Enter UHF-TAG-XXXXXX"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={isVerifying || !rfidInput}
                onClick={() => handleSimulateScan(rfidInput)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                Trigger Scan
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                Quick Test Tags from Active Queue:
              </div>
              <div className="flex flex-wrap gap-2">
                {bookings.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setRfidInput(b.rfid_tag);
                      handleSimulateScan(b.rfid_tag);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>{b.rfid_tag}</span>
                    <span className="text-slate-400">({b.farmer_name.split(' ')[0]})</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setRfidInput('UHF-TAG-UNAUTHORIZED');
                    handleSimulateScan('UHF-TAG-UNAUTHORIZED');
                  }}
                  className="text-[11px] px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-md font-mono cursor-pointer"
                >
                  Unregistered Tag (Test Rejection)
                </button>
              </div>
            </div>
          </div>

          {verifyResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                verifyResult.gate_open
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {verifyResult.gate_open ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{verifyResult.message}</span>
              </div>
              {verifyResult.booking && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200/60 font-mono">
                  <div>Farmer: {verifyResult.booking.farmer_name}</div>
                  <div>Crop: {verifyResult.booking.crop_type}</div>
                  <div>Plate: {verifyResult.booking.vehicle_number}</div>
                  <div>Slot: {verifyResult.booking.slot_window}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-600" />
              Live Hardware Serial Telemetry (ESP32 Gate)
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              115200 BAUD
            </span>
          </div>

          <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] h-96 overflow-y-auto space-y-1.5">
            {gateLogs.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">No gate telemetry captured yet.</div>
            ) : (
              gateLogs.map((log) => (
                <div key={log.id} className="leading-relaxed border-b border-slate-900 pb-1">
                  <span className="text-slate-500">[{log.timestamp.split('T')[1].slice(0, 8)}]</span>{' '}
                  <span
                    className={
                      log.status === 'SUCCESS'
                        ? 'text-emerald-400 font-bold'
                        : log.status === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    [{log.sensor_type}]
                  </span>{' '}
                  <span className="text-slate-300 font-semibold">{log.action}:</span>{' '}
                  <span className="text-slate-400">{log.raw_payload}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
