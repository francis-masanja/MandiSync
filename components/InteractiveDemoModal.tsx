'use client';

import React, { useState, useEffect } from 'react';
import { QrCodeCard } from './QrCodeCard';
import { hardwareAudio } from '@/lib/audio';
import {
  Sparkles,
  X,
  Play,
  CheckCircle2,
  MapPin,
  Radio,
  Scale,
  WifiOff,
  Wifi,
  FileCheck,
  RotateCw,
  HardDrive,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Volume2
} from 'lucide-react';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export function InteractiveDemoModal({
  isOpen,
  onClose,
  onRefreshData,
}: InteractiveDemoModalProps) {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isAutomating, setIsAutomating] = useState<boolean>(false);

  // Phase 1 State
  const [p1State, setP1State] = useState<'IDLE' | 'GPS_LOCATING' | 'SLOT_RESERVED'>('IDLE');
  const [bookingRef, setBookingRef] = useState('BK-DEMO-901');

  // Phase 2 State (Gate)
  const [gateAngle, setGateAngle] = useState(0);
  const [gateStatus, setGateStatus] = useState<'IDLE' | 'SCANNING' | 'ACCESS_GRANTED'>('IDLE');

  // Phase 3 State (Weighbridge)
  const [weighStep, setWeighStep] = useState<'IDLE' | 'GROSS' | 'TARE' | 'COMPLETED'>('IDLE');
  const [scaleDisplayKg, setScaleDisplayKg] = useState(0);

  // Phase 4 State (Offline Fault Tolerance)
  const [networkMode, setNetworkMode] = useState<'ONLINE' | 'OFFLINE_BUFFER' | 'SYNCED'>('ONLINE');
  const [littleFsRecords, setLittleFsRecords] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsAutomating(false);
      setP1State('IDLE');
      setGateAngle(0);
      setGateStatus('IDLE');
      setWeighStep('IDLE');
      setScaleDisplayKg(0);
      setNetworkMode('ONLINE');
      setLittleFsRecords(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Phase 1 trigger
  const runPhase1 = async () => {
    setP1State('GPS_LOCATING');
    await new Promise((r) => setTimeout(r, 900));

    try {
      const res = await fetch('/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: 'Balwinder Singh (Demo)',
          farmerPhone: '+91 98765 00112',
          farmerVillage: 'Nilokheri Agri Farm',
          farmerLat: 29.6857,
          farmerLon: 76.9905,
          mandiId: 'mandi-01',
          slotId: 'slot-01',
          cropType: 'Wheat (Sharbati HD-3086)',
          estimatedKg: 2800,
          vehicleNumber: 'PB-10-DEMO-99',
          rfidTag: 'UHF-DEMO-771',
        }),
      });
      const data = await res.json();
      if (data?.booking?.id) {
        setBookingRef(data.booking.id);
      }
    } catch (e) {
      console.error(e);
    }

    setP1State('SLOT_RESERVED');
    hardwareAudio.playBuzzerSuccess();
    onRefreshData();
  };

  // Phase 2 trigger
  const runPhase2 = async () => {
    setGateStatus('SCANNING');
    await new Promise((r) => setTimeout(r, 800));

    hardwareAudio.playBuzzerSuccess();
    hardwareAudio.playRelayClick();
    setGateStatus('ACCESS_GRANTED');
    setGateAngle(90);

    try {
      await fetch('/api/v1/telemetry/gate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid_tag: 'UHF-DEMO-771',
          device_id: 'ESP32-GATE-NODE-01',
        }),
      });
      onRefreshData();
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setGateAngle(0);
    }, 4500);
  };

  // Phase 3 trigger
  const runPhase3Gross = async () => {
    setWeighStep('GROSS');
    setScaleDisplayKg(6800);
    hardwareAudio.playScaleChime();

    try {
      await fetch('/api/v1/telemetry/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingRef,
          weight_kg: 6800,
          measurement_type: 'GROSS',
          device_id: 'ESP32-SCALE-NODE-01',
        }),
      });
      onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const runPhase3Tare = async () => {
    setWeighStep('TARE');
    setScaleDisplayKg(4000);
    hardwareAudio.playScaleChime();

    try {
      await fetch('/api/v1/telemetry/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingRef,
          weight_kg: 4000,
          measurement_type: 'TARE',
          device_id: 'ESP32-SCALE-NODE-01',
        }),
      });
      setWeighStep('COMPLETED');
      hardwareAudio.playBuzzerSuccess();
      onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 4 trigger
  const triggerOfflineSimulation = () => {
    setNetworkMode('OFFLINE_BUFFER');
    setLittleFsRecords((prev) => prev + 1);
    hardwareAudio.playScaleChime();
  };

  const syncOfflineSimulation = async () => {
    setNetworkMode('SYNCED');
    setLittleFsRecords(0);
    hardwareAudio.playBuzzerSuccess();

    try {
      await fetch('/api/v1/telemetry/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingRef,
          weight_kg: 4000,
          measurement_type: 'TARE',
          device_id: 'ESP32-SCALE-NODE-01',
          source: 'LITTLEFS_BUFFER',
        }),
      });
      onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Interactive MandiSync 4-Phase Hardware Simulation
              </h2>
              <p className="text-xs text-slate-500">
                Live test of GPS Slot Allocation, UHF RFID Boom Barrier, Weighbridge ADC, and LittleFS Buffer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-white">
          {[
            { phase: 1, title: 'Phase 1: Home', subtitle: 'GPS & Slot Pass' },
            { phase: 2, title: 'Phase 2: Gate', subtitle: 'RFID & Barrier' },
            { phase: 3, title: 'Phase 3: Scale', subtitle: 'HX711 Gross/Tare' },
            { phase: 4, title: 'Phase 4: Sync', subtitle: 'LittleFS & Receipt' },
          ].map((item) => (
            <button
              key={item.phase}
              type="button"
              onClick={() => setCurrentPhase(item.phase as any)}
              className={`p-3 text-left border-r last:border-r-0 transition-colors cursor-pointer ${
                currentPhase === item.phase
                  ? 'bg-emerald-50/80 border-b-2 border-b-emerald-600 text-emerald-950 font-bold'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="text-xs">{item.title}</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">{item.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* PHASE 1 */}
          {currentPhase === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  Screen 1 to 4 Simulation
                </span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Farmer Geolocation & Offline HMAC Slot Reservation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The client app obtains GPS coordinates (29.6857° N, 76.9905° E), queries libSQL with Haversine distance math, verifies remaining mandi daily quota (5,500 / 10,000 kg), and executes an atomic db.batch slot reservation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-3">
                  <div className="text-xs font-semibold text-slate-800">Booking Execution Trigger:</div>
                  <button
                    type="button"
                    onClick={runPhase1}
                    disabled={p1State === 'GPS_LOCATING'}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {p1State === 'GPS_LOCATING' ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {p1State === 'SLOT_RESERVED' ? 'Re-run Slot Reservation' : 'Simulate GPS Slot Booking'}
                  </button>

                  <div className="text-[11px] text-slate-500 font-mono space-y-1 pt-2 border-t border-slate-100">
                    <div>GPS Coordinates: 29.6857° N, 76.9905° E</div>
                    <div>Distance to Mandi: 14.2 km</div>
                    <div>Quota Status: 4,500 kg left in Karnal Mandi</div>
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl bg-white flex flex-col items-center justify-center text-center">
                  {p1State === 'SLOT_RESERVED' ? (
                    <div className="space-y-2">
                      <QrCodeCard
                        data={`MANDISYNC:${bookingRef}:HMAC_TOKEN_771920`}
                        title="Offline HMAC Digital Pass"
                        size={120}
                      />
                      <div className="text-[11px] font-mono font-bold text-emerald-700">
                        {bookingRef} • RFID UHF-DEMO-771
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Saved into IndexedDB (Works 100% offline)
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-6">
                      Click the green button to trigger GPS booking and generate the offline pass.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(2)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to Phase 2: Mandi Gate Entry
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2 */}
          {currentPhase === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                  Phase 2: At Mandi Gate
                </span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-600" />
                  UHF RFID Transponder & Servo Boom Barrier Actuation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Truck arrives at the gate. The UHF reader picks up tag <strong>UHF-DEMO-771</strong>. The ESP32 micro-controller validates the booking slot and sends a 90-degree pulse to the servo barrier relay.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-48 h-32 flex flex-col items-center justify-end relative">
                    <div className="w-8 h-24 bg-slate-700 rounded-t border border-slate-600 flex items-center justify-center text-[9px] text-slate-300 font-mono">
                      SERVO
                    </div>
                    <div
                      className="absolute bottom-5 left-1/2 w-40 h-3 bg-amber-400 rounded-r transition-transform duration-500 origin-left"
                      style={{ transform: `rotate(-${gateAngle}deg)` }}
                    />
                  </div>

                  <div className="mt-3 text-xs font-mono">
                    {gateStatus === 'ACCESS_GRANTED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        GATE OPEN (90°) — BUZZER ACTIVE
                      </span>
                    ) : (
                      <span className="text-slate-400">BARRIER CLOSED (0°)</span>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 mb-1">
                      Simulate RFID Vehicle Approach:
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Plays realistic synthesizer audio clicks, sounds buzzer, and actuates barrier servo.
                    </p>
                    <button
                      type="button"
                      onClick={runPhase2}
                      disabled={gateStatus === 'SCANNING'}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      Scan Tag & Trigger Boom Barrier
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600">
                    <div>TAG: UHF-DEMO-771</div>
                    <div>RESPONSE: 200 OK (VALID_SLOT)</div>
                    <div>RELAY PIN 18: HIGH (15000ms)</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Back to Phase 1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPhase(3)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to Phase 3: Weighbridge Scale
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3 */}
          {currentPhase === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                  Phase 3: At Mandi Weighbridge
                </span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  HX711 24-Bit ADC Dual Weighing (Gross Laden & Tare Unladen)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Truck enters weighbridge pit. HX711 sensor reads laden weight (6,800 kg). After grain dumping in the procurement bay, truck re-enters for tare unladen reading (4,000 kg).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-xl text-center text-white flex flex-col justify-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    ESP32 SCALE DISPLAY
                  </div>
                  <div className="text-4xl font-black font-mono text-emerald-400 my-2">
                    {scaleDisplayKg.toLocaleString()} <span className="text-xl text-emerald-600">KG</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    STATUS: {weighStep === 'IDLE' ? 'READY' : weighStep}
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-3">
                  <div className="text-xs font-semibold text-slate-800">
                    Two-Stage Weight Automation:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={runPhase3Gross}
                      className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      1. Record Gross (6,800 kg)
                    </button>

                    <button
                      type="button"
                      onClick={runPhase3Tare}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      2. Record Tare (4,000 kg)
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gross Weight:</span>
                      <strong>6,800 kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tare Weight:</span>
                      <strong>4,000 kg</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      <span>Net Harvest:</span>
                      <span>2,800 kg (28.00 Qtl)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(2)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Back to Phase 2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPhase(4)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to Phase 4: Network Resilience & Receipt
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4 */}
          {currentPhase === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                  Phase 4: Fault Tolerance & Digital Procurement Receipt
                </span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  ESP32 LittleFS Flash Offline Buffering & Automatic Cloud Sync
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Demonstrates rural connectivity resilience: when rural fiber drops out, ESP32 safely writes scale weight packets to onboard LittleFS flash memory. Upon WiFi reconnect, records batch upload without data loss.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">Mandi WiFi Connectivity:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        networkMode === 'OFFLINE_BUFFER'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {networkMode === 'OFFLINE_BUFFER' ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                      {networkMode === 'OFFLINE_BUFFER' ? 'OFFLINE (Zero WAN)' : 'ONLINE (APMC Mesh)'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={triggerOfflineSimulation}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <WifiOff className="w-4 h-4" />
                      1. Cut Network & Buffer in LittleFS ({littleFsRecords} files)
                    </button>

                    <button
                      type="button"
                      onClick={syncOfflineSimulation}
                      disabled={littleFsRecords === 0 && networkMode !== 'OFFLINE_BUFFER'}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <HardDrive className="w-4 h-4" />
                      2. Reconnect WiFi & Flush LittleFS Buffer
                    </button>
                  </div>

                  {networkMode === 'SYNCED' && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All offline records synchronized to Turso / libSQL cloud.</span>
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Screen 5 Digital Procurement Certificate
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Booking:</span>
                      <strong>{bookingRef}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Net Grain Delivered:</span>
                      <strong className="text-emerald-700">2,800 kg (28 Qtl)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MSP Rate (Wheat):</span>
                      <strong>₹2,275 / Qtl</strong>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Payout:</span>
                      <span className="text-emerald-600">₹63,700</span>
                    </div>
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded mt-2 text-center">
                      ✓ DBT Ref #APMC-DEMO-63700 credited to farmer account
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(3)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Back to Phase 3
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Finish Demo Simulation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
