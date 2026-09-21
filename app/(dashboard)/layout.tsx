'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <div className="lg:pl-64 min-h-[calc(100vh-4rem)] pb-24 lg:pb-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Breadcrumb />
          <div className="animate-in fade-in duration-300 slide-in-from-y-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}