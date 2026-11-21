import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  Layers,
  Radio,
  Scale,
  Settings,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import { db } from '@/server/db';

export const metadata: Metadata = {
  title: 'Network Overview — MandiSync',
  description: 'Admin overview of mandis, bookings, and telemetry.',
};

export const dynamic = 'force-dynamic';

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'GATE_VERIFIED', 'WEIGHED_GROSS']);

function formatKg(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} t`;
  return `${Math.round(value)} kg`;
}

function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function AdminOverviewPage() {
  const [mandis, bookings, logs] = await Promise.all([
    db.getMandis(),
    db.getBookings(),
    db.getTelemetryLogs(6),
  ]);

  const active = bookings.filter((booking) => ACTIVE_STATUSES.has(booking.status));
  const completed = bookings.filter((booking) => booking.status === 'COMPLETED');
  const deliveredKg = completed.reduce(
    (total, booking) => total + (booking.actualNetKg ?? booking.estimatedKg ?? 0),
    0
  );
  const capacityKg = mandis.reduce((total, mandi) => total + mandi.maxDailyKg, 0);
  const allocatedKg = mandis.reduce((total, mandi) => total + mandi.allocatedTodayKg, 0);
  const utilization = capacityKg > 0 ? Math.min(100, Math.round((allocatedKg / capacityKg) * 100)) : 0;

  const stats = [
    {
      label: 'Bookings',
      value: bookings.length,
      hint: `${completed.length} completed · ${active.length} active`,
      icon: Layers,
    },
    {
      label: 'In progress',
      value: active.length,
      hint: 'Awaiting gate or weighbridge',
      icon: Truck,
    },
    {
      label: 'Mandi network',
      value: mandis.length,
      hint: `${formatKg(capacityKg)} daily capacity`,
      icon: Store,
    },
    {
      label: 'Delivered',
      value: formatKg(deliveredKg),
      hint: `${utilization}% of today’s capacity allocated`,
      icon: Scale,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="clay-card p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--clay-faint)]">
              Administrator view
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
              Network overview
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--clay-muted)]">
              Every mandi, booking, and telemetry stream in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/queue" className="clay-btn">
              <Layers className="h-4 w-4" />
              Queue ledger
            </Link>
            <Link href="/gate" className="clay-btn clay-btn-accent">
              <Radio className="h-4 w-4" />
              Open gate desk
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="clay-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
                {label}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
              {value}
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--clay-muted)]">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="clay-card p-5 sm:p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--clay-text)]">Mandi capacity</h3>
            <span className="clay-chip clay-chip-accent">{utilization}% allocated</span>
          </div>
          <ul className="space-y-3">
            {mandis.map((mandi) => {
              const pct =
                mandi.maxDailyKg > 0
                  ? Math.min(100, Math.round((mandi.allocatedTodayKg / mandi.maxDailyKg) * 100))
                  : 0;
              return (
                <li key={mandi.id} className="clay-inset p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--clay-text)]">
                        {mandi.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-[var(--clay-muted)]">
                        {mandi.location} · {mandi.activeQueueCount} in queue · ~{mandi.avgWaitMinutes} min
                      </p>
                    </div>
                    <span className="flex-none text-xs font-bold text-[var(--clay-accent-strong)]">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--clay-surface-3)] shadow-[var(--clay-inset)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--clay-accent),var(--clay-accent-strong))]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-[var(--clay-faint)]">
                    {formatKg(mandi.allocatedTodayKg)} of {formatKg(mandi.maxDailyKg)} today
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-5 lg:col-span-2">
          <section className="clay-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--clay-text)]">Recent telemetry</h3>
              <Activity className="h-4 w-4 text-[var(--clay-faint)]" />
            </div>
            {logs.length === 0 ? (
              <p className="rounded-xl bg-[var(--clay-surface-2)] p-3 text-xs font-medium text-[var(--clay-muted)]">
                No weighbridge events recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[var(--clay-surface-2)] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--clay-text)]">
                        {log.type} · {log.rfidTag || log.bookingId}
                      </p>
                      <p className="text-[10px] font-medium text-[var(--clay-faint)]">
                        {log.deviceId} · {formatTime(log.createdAt)}
                      </p>
                    </div>
                    <span className="flex-none text-xs font-bold text-[var(--clay-accent-strong)]">
                      {log.weightKg} kg
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="clay-card p-5 sm:p-6">
            <h3 className="mb-3 text-base font-bold text-[var(--clay-text)]">Admin tools</h3>
            <div className="space-y-2">
              <Link
                href="/queue"
                className="flex items-center justify-between rounded-xl bg-[var(--clay-surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--clay-text)] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--clay-accent-strong)]" />
                  Reconcile all bookings
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--clay-faint)]" />
              </Link>
              <Link
                href="/gate"
                className="flex items-center justify-between rounded-xl bg-[var(--clay-surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--clay-text)] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-[var(--clay-accent-strong)]" />
                  Handle gate exceptions
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--clay-faint)]" />
              </Link>
              <Link
                href="/settings#diagnostics"
                className="flex items-center justify-between rounded-xl bg-[var(--clay-surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--clay-text)] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[var(--clay-accent-strong)]" />
                  Inspect runtime logs
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--clay-faint)]" />
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--clay-accent-soft)] px-3 py-2 text-[11px] font-semibold text-[var(--clay-accent-strong)]">
              <Users className="h-4 w-4" />
              Admins inherit operator gate and queue access.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
