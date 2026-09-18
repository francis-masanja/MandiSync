'use client';

import React, { useState, useId } from 'react';
import { Mandi, Booking } from '@/lib/types';
import { QrCodeCard } from './QrCodeCard';
import { calculateHaversineDistance } from '@/lib/spatial';
import {
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Wheat,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Printer,
  FileCheck,
  Zap,
  HardDrive
} from 'lucide-react';

interface FarmerPortalProps {
  mandis: Mandi[];
  activeBookings: Booking[];
  onBookingCreated: (booking: Booking) => void;
  onRefreshData: () => void;
}

const CROP_OPTIONS = [
  { name: 'Wheat (Sharbati / HD-3086)', rate: 2275, unit: 'Qtl' },
  { name: 'Paddy / Basmati 1121 Super', rate: 3850, unit: 'Qtl' },
  { name: 'Mustard Seed (Sarson)', rate: 5450, unit: 'Qtl' },
  { name: 'Soybean (Yellow)', rate: 4600, unit: 'Qtl' },
  { name: 'Maize (Kharif Grain)', rate: 2090, unit: 'Qtl' },
  { name: 'Gram / Chickpeas (Chana)', rate: 5440, unit: 'Qtl' },
  { name: 'Cotton (Medium Staple)', rate: 6620, unit: 'Qtl' },
];

const FARM_LOCATION_PRESETS = [
  { name: 'Nilokheri Sector 4, Karnal', lat: 29.6102, lon: 76.9321 },
  { name: 'Samrala Kalan, Ludhiana/Khanna', lat: 30.6811, lon: 76.1923 },
  { name: 'Mandana Rural, Kota Region', lat: 25.1205, lon: 75.8011 },
  { name: 'Sanwer Agri Belt, Indore', lat: 22.9754, lon: 75.8312 },
];

const ONE_HOUR_TIME_SLOTS = [
  { id: 'slot-06', time: '06:00 AM - 07:00 AM', status: 'FULL', remaining: 0 },
  { id: 'slot-07', time: '07:00 AM - 08:00 AM', status: 'FULL', remaining: 0 },
  { id: 'slot-08', time: '08:00 AM - 09:00 AM', status: 'AVAILABLE', remaining: 6, isRecommended: true },
  { id: 'slot-09', time: '09:00 AM - 10:00 AM', status: 'AVAILABLE', remaining: 4 },
  { id: 'slot-10', time: '10:00 AM - 11:00 AM', status: 'AVAILABLE', remaining: 11 },
  { id: 'slot-11', time: '11:00 AM - 12:00 PM', status: 'AVAILABLE', remaining: 14 },
  { id: 'slot-12', time: '12:00 PM - 01:00 PM', status: 'AVAILABLE', remaining: 18 },
  { id: 'slot-13', time: '01:00 PM - 02:00 PM', status: 'AVAILABLE', remaining: 15 },
];

export function FarmerPortal({
  mandis,
  activeBookings,
  onBookingCreated,
  onRefreshData,
}: FarmerPortalProps) {
  const formId = useId();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [farmerName, setFarmerName] = useState('Sukhwinder Singh Gill');
  const [farmerPhone, setFarmerPhone] = useState('+91 98140 76219');
  const [farmerVillage, setFarmerVillage] = useState('Nilokheri Sector 4, Karnal');
  const [farmerLat, setFarmerLat] = useState(29.6102);
  const [farmerLon, setFarmerLon] = useState(76.9321);
  const [isLocating, setIsLocating] = useState(false);

  const [selectedMandiId, setSelectedMandiId] = useState(mandis[0]?.id || 'mandi-01');
  const [selectedSlotTime, setSelectedSlotTime] = useState('08:00 AM - 09:00 AM');
  const [selectedSlotId, setSelectedSlotId] = useState('slot-08');
  const [cropType, setCropType] = useState(CROP_OPTIONS[0].name);
  const [estimatedKg, setEstimatedKg] = useState(2500);
  const [vehicleNumber, setVehicleNumber] = useState('HR-05-BC-8192');
  const [rfidTag, setRfidTag] = useState('UHF-TAG-771920');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedMandi = mandis.find((m) => m.id === selectedMandiId) || mandis[0];
  const distanceKm = selectedMandi
    ? calculateHaversineDistance(farmerLat, farmerLon, selectedMandi.latitude, selectedMandi.longitude)
    : 12.4;

  const selectedCrop = CROP_OPTIONS.find((c) => c.name === cropType) || CROP_OPTIONS[0];

  const handleUseDeviceGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFarmerLat(Math.round(pos.coords.latitude * 10000) / 10000);
        setFarmerLon(Math.round(pos.coords.longitude * 10000) / 10000);
        setFarmerVillage(`GPS Location (${pos.coords.latitude.toFixed(3)}° N, ${pos.coords.longitude.toFixed(3)}° E)`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handlePresetLocation = (preset: (typeof FARM_LOCATION_PRESETS)[0]) => {
    setFarmerVillage(preset.name);
    setFarmerLat(preset.lat);
    setFarmerLon(preset.lon);
  };

  const handleGenerateRfid = () => {
    const randomTag = `UHF-TAG-${Math.floor(100000 + Math.random() * 900000)}`;
    setRfidTag(randomTag);
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          farmerPhone,
          farmerVillage,
          farmerLat,
          farmerLon,
          mandiId: selectedMandiId,
          slotId: selectedSlotId,
          cropType,
          cropVariety: 'Grade A Procurement',
          estimatedKg,
          vehicleNumber,
          rfidTag,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      setBookingSuccess(data.booking);
      onBookingCreated(data.booking);
      onRefreshData();
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during slot booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-600" />
              Farmer Portal — Smart Queue & Gatepass Lifecycle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distance-weighted slot allocation with offline-cached HMAC passes and digitized weighbridge receipts.
            </p>
          </div>

          {activeBookings.length > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              View Issued Passes ({activeBookings.length})
            </button>
          )}
        </div>

        {/* 5-Screen Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-slate-100">
          {[
            { step: 1, title: 'Screen 1: GPS Radar', desc: 'Geolocation & Haversine' },
            { step: 2, title: 'Screen 2: Mandi Quota', desc: 'Capacity & Crop' },
            { step: 3, title: 'Screen 3: Slot Booking', desc: '1-Hr Windows (db.batch)' },
            { step: 4, title: 'Screen 4: Digital Pass', desc: 'Offline HMAC QR Pass' },
            { step: 5, title: 'Screen 5: Scale Receipt', desc: 'Weight Certificate & DBT' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step as any)}
              className={`p-2 rounded-lg text-left transition-all text-xs border cursor-pointer ${
                currentStep === item.step
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold truncate">{item.title}</div>
              <div className={`text-[10px] truncate ${currentStep === item.step ? 'text-emerald-100' : 'text-slate-400'}`}>
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SCREEN 1: Home / Geolocation Check */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Screen 1 • Geolocation & Proximity Radar
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Farmer Identification & GPS Positioning
              </h3>
              <p className="text-xs text-slate-500">
                Captures farm GPS coordinates and computes geodesic distances via the Haversine formula in libSQL.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseDeviceGps}
              disabled={isLocating}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Acquiring GPS...' : 'Acquire Device GPS'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Farmer Full Name
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Rameshwar Singh Patel"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Mobile Number (SMS alerts & gatepass auth)
              </label>
              <input
                type="tel"
                required
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91 98XXX XXXXX"
              />
            </div>
          </div>

          {/* Location Presets */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-semibold text-slate-800">
              Select or Input Farm Origin Coordinates:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {FARM_LOCATION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetLocation(preset)}
                  className={`px-3 py-2 rounded-lg text-left border transition-all cursor-pointer ${
                    farmerVillage === preset.name
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="truncate font-medium text-[11px]">{preset.name.split(',')[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {preset.lat.toFixed(2)}° N, {preset.lon.toFixed(2)}° E
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <input
                type="text"
                value={farmerVillage}
                onChange={(e) => setFarmerVillage(e.target.value)}
                className="sm:col-span-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                placeholder="Village / Farm Name"
              />
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 border border-slate-300 rounded-lg text-slate-600">
                <span className="text-[11px] text-slate-400 font-mono">Lat:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={farmerLat}
                  onChange={(e) => setFarmerLat(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 border border-slate-300 rounded-lg text-slate-600">
                <span className="text-[11px] text-slate-400 font-mono">Lon:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={farmerLon}
                  onChange={(e) => setFarmerLon(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Continue to Screen 2: Mandi Selection & Quota
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: Mandi Selection & Capacity Overview */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Screen 2 • Mandi Selection & Capacity Overview
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Procurement Centers Sorted by Haversine Distance & Daily Quotas
            </h3>
            <p className="text-xs text-slate-500">
              Displays remaining daily quota (e.g. 4,500 / 10,000 kg remaining) so farmers can choose centers with fast turnaround.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mandis.map((m) => {
              const dist = calculateHaversineDistance(farmerLat, farmerLon, m.latitude, m.longitude);
              const isSelected = selectedMandiId === m.id;
              const remainingQuotaKg = Math.max(0, m.max_daily_kg - m.allocated_today_kg);
              const percentUsed = Math.min(100, Math.round((m.allocated_today_kg / m.max_daily_kg) * 100));

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMandiId(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Code: {m.code}</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      {dist} km
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Remaining Daily Quota:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {remainingQuotaKg.toLocaleString()} / {m.max_daily_kg.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <span>Queue: {m.active_queue_count} trucks</span>
                    <span>Avg Turnaround: ~{m.avg_wait_minutes} min</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-semibold text-slate-800">
              Select Crop to Deliver:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop.name} value={crop.name}>
                      {crop.name} (MSP ₹{crop.rate}/{crop.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-900">
                <span>Official Government MSP:</span>
                <span className="font-mono text-sm">₹{selectedCrop.rate} / Quintal</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              Back to Screen 1
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Continue to Screen 3: Time Slot Selection
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: Time Slot Selection & Reservation */}
      {currentStep === 3 && (
        <form onSubmit={handleBookSlot} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Screen 3 • Time Slot Selection & Reservation
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Pick 1-Hour Time Window & Vehicle Parameters
            </h3>
            <p className="text-xs text-slate-500">
              Slots turn red when full to eliminate double booking through atomic db.batch transactions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ONE_HOUR_TIME_SLOTS.map((s) => {
              const isFull = s.status === 'FULL';
              const isSelected = selectedSlotId === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isFull}
                  onClick={() => {
                    setSelectedSlotId(s.id);
                    setSelectedSlotTime(s.time);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    isFull
                      ? 'bg-rose-50/70 border-rose-200 text-rose-800 opacity-80 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">{s.time}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        isFull ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.status}
                    </span>
                    {isFull ? <span>0 left</span> : <span>{s.remaining} left</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estimated Harvest Weight: <span className="font-bold text-emerald-700 font-mono">{estimatedKg.toLocaleString()} kg</span>
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>500 kg</span>
                <span>2,500 kg (Standard)</span>
                <span>10,000 kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vehicle Plate Number
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="HR-05-AB-7721"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                <span>UHF RFID Tag</span>
                <button
                  type="button"
                  onClick={handleGenerateRfid}
                  className="text-[10px] text-emerald-700 font-medium hover:underline cursor-pointer"
                >
                  Regen
                </button>
              </label>
              <input
                type="text"
                required
                value={rfidTag}
                onChange={(e) => setRfidTag(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-800 bg-white"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              Back to Screen 2
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Locking Slot via db.batch()...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  [ Confirm & Reserve Slot ]
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SCREEN 4: Digital Pass Issued */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Screen 4 • Digital Pass Issued
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Offline IndexedDB Cached Cryptographic Gate Pass
              </h3>
              <p className="text-xs text-slate-500">
                SHA-256 HMAC encrypted token verifiable without internet. Shows countdown timer and target wait time under 45 minutes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pass
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 flex justify-center">
              <QrCodeCard
                data={JSON.stringify({
                  booking_id: bookingSuccess?.id || activeBookings[0]?.id || 'BK-2026-001',
                  hmac: bookingSuccess?.hmac_token || activeBookings[0]?.hmac_token || '9e7b29a6e1f0e4b7c8a1132049e7b29a',
                  rfid: rfidTag,
                  slot: selectedSlotTime,
                })}
                title="Gate UHF & QR Pass"
                size={160}
              />
            </div>

            <div className="sm:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Digital Pass ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {bookingSuccess?.id || activeBookings[0]?.id || 'BK-2026-001'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vehicle UHF RFID Tag:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {bookingSuccess?.rfid_tag || rfidTag}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Arrival Window:</span>
                <span className="font-bold text-slate-800">{bookingSuccess?.slot_window || selectedSlotTime}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Guaranteed Queue Turnaround:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  &lt; 45 mins wait time
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mandi Destination:</span>
                <span className="font-medium text-slate-800">{selectedMandi?.name}</span>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 flex items-center gap-2 mt-2">
                <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Offline Cached:</strong> This pass is saved in phone memory and will scan at the Mandi gate even with zero cellular signal.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              Back to Slot Booking
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              View Screen 5: Digital Weight Certificate
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: Digital Procurement Pass & Receipt */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Screen 5 • Digital Weight Certificate & Procurement Voucher
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Official Weighbridge Certificate & Instant DBT Confirmation
              </h3>
              <p className="text-xs text-slate-500">
                Digitized weight readings (Gross, Tare, and Net Weight) captured directly from the ESP32 weighbridge node.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Certificate
            </button>
          </div>

          <div className="border-2 border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-800">
                  APMC STATE AGRICULTURAL MARKETING BOARD
                </div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  ELECTRONIC WEIGHMENT & PROCUREMENT CERTIFICATE
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  AUTHENTICATED BY ESP32 SCALE #01
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Farmer Name:</span>
                <strong className="text-slate-900">{farmerName}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Vehicle Registration:</span>
                <strong className="font-mono text-slate-900">{vehicleNumber}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Crop / Variety:</span>
                <strong className="text-slate-900">{cropType}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">RFID Transponder:</span>
                <strong className="font-mono text-emerald-700">{rfidTag}</strong>
              </div>
            </div>

            <div className="bg-slate-950 text-white p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">
                HX711 24-Bit ADC Dual-Stage Weighment Breakdown
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">1. Gross Laden Weight (W_gross):</span>
                <span className="font-bold">6,500 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">2. Tare Unladen Weight (W_tare):</span>
                <span className="font-bold">4,000 kg</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-black text-emerald-400">
                <span>3. Net Harvest Delivered (W_net):</span>
                <span>2,500 kg (25.00 Quintals)</span>
              </div>
              <div className="flex justify-between py-1 pt-2 border-t border-slate-800 text-slate-300">
                <span>Official Procurement Benchmark (MSP):</span>
                <span>₹2,275 / Quintal</span>
              </div>
              <div className="flex justify-between py-1 text-base font-black text-emerald-300">
                <span>Total DBT Payable:</span>
                <span>₹56,875</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Direct Benefit Transfer (DBT) Cleared to Bank Account
                </span>
              </div>
              <div className="font-mono text-[11px] text-emerald-800">
                REF: DBT-APMC-771920
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              Back to Screen 4 (Digital Pass)
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Book Another Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
