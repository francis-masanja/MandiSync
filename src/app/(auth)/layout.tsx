import React from 'react';
import { ThemeToggle } from '@/features/system/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="clay-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--clay-accent)] opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[var(--clay-clay)] opacity-20 blur-3xl"
      />
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
