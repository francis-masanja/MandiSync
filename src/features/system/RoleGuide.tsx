'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { roleHome, roleLabel, type UserRole } from '@/shared/roles';

interface RoleGuideProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}

const STEPS: Record<UserRole, { title: string; body: string }[]> = {
  farmer: [
    {
      title: 'Book a slot',
      body: 'Pick a mandi, a date, and an available slot from your farmer panel.',
    },
    {
      title: 'Carry your QR pass',
      body: 'Every confirmed booking issues a QR pass you can show on your phone.',
    },
    {
      title: 'Arrive at the gate',
      body: 'The operator scans your pass, then the weighbridge captures gross, tare, and net weight.',
    },
    {
      title: 'Track delivery status',
      body: 'Queue position, gate status, and completed weigh-ins update live in your panel.',
    },
  ],
  operator: [
    {
      title: 'Watch live arrivals',
      body: 'The gate desk lists today’s bookings with slot pressure and queue position.',
    },
    {
      title: 'Verify the pass',
      body: 'Scan the farmer QR or enter the booking reference to admit the load.',
    },
    {
      title: 'Capture weight',
      body: 'Telemetry from the bridge fills gross, tare, and net automatically — override only when needed.',
    },
    {
      title: 'Sync buffers',
      body: 'Reconcile offline captures once the link returns so the ledger stays consistent.',
    },
  ],
  admin: [
    {
      title: 'See the whole network',
      body: 'The overview aggregates every mandi, booking, and telemetry log.',
    },
    {
      title: 'Audit the queue ledger',
      body: 'Inspect and reconcile all bookings across mandis, not just today’s desk.',
    },
    {
      title: 'Step into the gate desk',
      body: 'Handle exceptions at the operator desk without switching accounts.',
    },
    {
      title: 'Inspect diagnostics',
      body: 'Enable verbose logging in Settings and export the runtime log when something looks wrong.',
    },
  ],
};

export function RoleGuide({ role, open, onClose }: RoleGuideProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#1a1410]/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-guide-title"
      onClick={onClose}
    >
      <div
        className="clay-card w-full max-w-xl overflow-hidden clay-fade"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--clay-line)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 id="role-guide-title" className="text-lg font-bold text-[var(--clay-text)]">
                Quick guide
              </h2>
              <p className="text-xs font-medium text-[var(--clay-muted)]">
                Tailored to the {roleLabel(role)} role
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="clay-btn clay-btn-ghost !p-2"
            aria-label="Close guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ol className="max-h-[55vh] space-y-3 overflow-y-auto p-5 sm:p-6">
          {STEPS[role].map((step, index) => (
            <li key={step.title} className="clay-inset flex gap-3 p-3.5">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--clay-accent)] text-xs font-bold text-[#10231a]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--clay-text)]">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--clay-muted)]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-2 border-t border-[var(--clay-line)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-[11px] font-medium text-[var(--clay-faint)]">
            Only actions available to your role are shown.
          </p>
          <Link href={roleHome(role)} className="clay-btn clay-btn-accent" onClick={onClose}>
            Open my panel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
