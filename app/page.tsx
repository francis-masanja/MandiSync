'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mandi, Booking, TelemetryLog } from '@/lib/types';
import { FarmerPortal } from '@/components/FarmerPortal';
import { GateControlDesk } from '@/components/GateControlDesk';
import { HardwareBench } from '@/components/HardwareBench';
import { FirmwareView } from '@/components/FirmwareView';
import { InteractiveDemoModal } from '@/components/InteractiveDemoModal';
import {
  Wheat,
  Radio,
  Scale,
  Cpu,
  Layers,
  Sparkles,
  RotateCcw,
  Activity,
  CheckCircle2,
  Clock,
  Truck,
  Database
} from 'lucide-react';

export default function MandiSyncApp() {
  const [activeTab, setActiveTab] = useState<'FARMER' | 'GATE' | 'WEIGH' | 'QUEUE' | 'FIRMWARE'>('FARMER');
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total_queued: 0,
    gate_verified: 0,
    active_weighing: 0,
    completed_today: 0,
    total_procured_kg: 0,
    target_avg_wait_minutes: 35,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const fetchQueueData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/queue/status');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setLogs(data.logs || []);
        setMandis(data.mandis || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval);
  }, [fetchQueueData]);

  const handleResetData = async () => {
    if (confirm('Reset all demo queue records and logs back to initial factory seeds?')) {
      await fetch('/api/v1/reset', { method: 'POST' });
      fetchQueueData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  MandiSync
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  IoT APMC Gateway
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dynamic Slot Allocation • UHF RFID Gate Control • 24-Bit ADC Weighbridge
              </p>
            </div>
          </div>

          {/* Quick Actions & Demo Trigger */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Demo Flow (4 Phases)
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset sample data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Seeds</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mesh Connected</span>
            </div>
          </div>
        </div>

        {/* Global Metric Strip */}
        <div className="border-t border-slate-100 bg-slate-50/70 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Queued Today:</span>
              <strong className="text-slate-900 font-mono">{metrics.total_queued}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-500">Gate Verified:</span>
              <strong className="text-blue-700 font-mono">{metrics.gate_verified}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500">At Weighbridge:</span>
              <strong className="text-amber-700 font-mono">{metrics.active_weighing}</strong>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-500">Completed Deliveries:</span>
              <strong className="text-emerald-700 font-mono">{metrics.completed_today}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-slate-500">Total Net Procured:</span>
              <strong className="text-purple-700 font-mono">
                {metrics.total_procured_kg.toLocaleString()} kg
              </strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-1 pt-1">
          {[
            { id: 'FARMER', label: '1. Farmer Portal (5-Screen)', icon: Wheat },
            { id: 'GATE', label: '2. RFID Gate Desk', icon: Radio },
            { id: 'WEIGH', label: '3. Weighbridge & LittleFS', icon: Scale },
            { id: 'QUEUE', label: '4. Live Queue Ledger', icon: Layers },
            { id: 'FIRMWARE', label: '5. ESP32 C++ Code', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'FARMER' && (
          <FarmerPortal
            mandis={mandis}
            activeBookings={bookings}
            onBookingCreated={() => fetchQueueData()}
            onRefreshData={fetchQueueData}
          />
        )}

        {activeTab === 'GATE' && (
          <GateControlDesk
            bookings={bookings}
            logs={logs}
            onRefreshData={fetchQueueData}
          />
        )}

        {activeTab === 'WEIGH' && (
          <HardwareBench
            bookings={bookings}
            logs={logs}
            onRefreshData={fetchQueueData}
          />
        )}

        {activeTab === 'QUEUE' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    APMC Central Procurement Queue Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live status tracking from initial slot booking to tare weighment and direct bank payout.
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500">
                  {bookings.length} Registered Bookings
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Farmer</th>
                      <th className="p-3">Mandi / Slot</th>
                      <th className="p-3">Vehicle / RFID</th>
                      <th className="p-3">Crop / Est.</th>
                      <th className="p-3">Gross / Tare / Net</th>
                      <th className="p-3">Payout</th>
                      <th className="p-3">Lifecycle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          No active bookings in queue. Book a delivery in the Farmer Portal!
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{b.id}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{b.farmer_name}</div>
                            <div className="text-[11px] text-slate-500">{b.farmer_village}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{b.mandi_name.split(' ')[0]}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{b.slot_window}</div>
                          </td>
                          <td className="p-3 font-mono">
                            <div className="font-bold text-slate-800">{b.vehicle_number}</div>
                            <div className="text-[10px] text-emerald-700">{b.rfid_tag}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{b.crop_type}</div>
                            <div className="text-[11px] text-slate-500">{b.estimated_kg.toLocaleString()} kg est.</div>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <div>G: {b.actual_gross_kg ? `${b.actual_gross_kg}kg` : '—'}</div>
                            <div>T: {b.actual_tare_kg ? `${b.actual_tare_kg}kg` : '—'}</div>
                            <div className="font-bold text-emerald-700">
                              N: {b.actual_net_kg ? `${b.actual_net_kg}kg` : '—'}
                            </div>
                          </td>
                          <td className="p-3 font-mono">
                            {b.total_payout_inr ? (
                              <span className="font-bold text-emerald-700">
                                ₹{b.total_payout_inr.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Pending Tare</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                                b.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'WEIGHED_GROSS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : b.status === 'GATE_VERIFIED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FIRMWARE' && <FirmwareView />}
      </main>

      {/* Interactive Simulation Modal */}
      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRefreshData={fetchQueueData}
      />
    </div>
  );
}
