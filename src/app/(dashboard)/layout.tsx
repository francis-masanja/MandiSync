import React from 'react';
import { Navigation } from '@/features/shell/Navigation';
import { Breadcrumb } from '@/features/shell/Breadcrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="clay-app min-h-screen">
      <Navigation />
      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          <Breadcrumb />
          <div className="clay-fade">{children}</div>
        </main>
      </div>
    </div>
  );
}
