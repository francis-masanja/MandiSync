'use client';

import React from 'react';
import Link from 'next/link';
import { Wheat, Radio, Scale, Layers, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primaryGlass backdrop-blur-16 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">MandiSync</h1>
            <p className="text-sm text-slate-500">Smart agricultural queue management &amp; IoT telemetry</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Choose a section</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <li>
            <Link
              href="/farmer"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Wheat className="w-5 h-5 text-emerald-600" /> Farmer Portal
            </Link>
          </li>
          <li>
            <Link
              href="/gate"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Radio className="w-5 h-5 text-blue-600" /> Gate Control Desk
            </Link>
          </li>
          <li>
            <Link
              href="/weigh"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Scale className="w-5 h-5 text-amber-600" /> Weighbridge &amp; LittleFS
            </Link>
          </li>
          <li>
            <Link
              href="/queue"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Layers className="w-5 h-5 text-purple-600" /> Queue Ledger
            </Link>
          </li>
          <li>
            <Link
              href="/firmware"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Cpu className="w-5 h-5 text-slate-600" /> Firmware View
            </Link>
          </li>
          <li>
            <Link
              href="/demo"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-shadow shadow-sm"
            >
              <Wheat className="w-5 h-5 text-emerald-600" /> Demo Flow
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
