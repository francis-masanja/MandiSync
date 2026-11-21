'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Activity, ArrowRight, Check, Moon, Palette, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { useTheme, type Theme } from './ThemeProvider';
import { LogsPanel } from './LogsPanel';
import { roleHome, roleLabel, type UserRole } from '@/shared/roles';

const ACCESS: Record<UserRole, string[]> = {
  farmer: ['Own bookings and slots', 'QR delivery pass', 'Local theme and diagnostics'],
  operator: ['Gate desk and queue ledger', 'Weighbridge telemetry', 'Buffer reconciliation'],
  admin: ['Network-wide overview', 'Every mandi and booking', 'Diagnostics and runtime logs'],
};

const THEME_OPTIONS: Array<{ id: Theme; label: string; description: string }> = [
  { id: 'light', label: 'Light clay', description: 'Warm sand and soft highlights' },
  { id: 'dark', label: 'Dark clay', description: 'Deep umber with muted glow' },
];

export function SettingsPanel() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const rawRole = (session?.user as { role?: string } | undefined)?.role;
  const role: UserRole | null =
    rawRole === 'farmer' || rawRole === 'operator' || rawRole === 'admin' ? rawRole : null;
  const name = session?.user?.name ?? 'Workspace member';
  const email = session?.user?.email ?? '—';
  const initial = name.trim().charAt(0).toUpperCase() || 'M';

  return (
    <div className="space-y-6">
      <section className="clay-card overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <span className="clay-avatar h-14 w-14 rounded-2xl text-xl font-extrabold">
              {initial}
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--clay-text)]">{name}</h2>
              <p className="text-sm font-medium text-[var(--clay-muted)]">
                {status === 'loading' ? 'Loading session…' : email}
              </p>
            </div>
          </div>
          {role && (
            <span className="clay-chip clay-chip-accent w-fit">
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleLabel(role)}
            </span>
          )}
        </div>
        <div className="border-t border-[var(--clay-line)] bg-[var(--clay-surface-2)]/60 px-5 py-3 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--clay-faint)]">
            This account can access
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(role ? ACCESS[role] : []).map((item) => (
              <span key={item} className="clay-chip">
                <Check className="h-3 w-3" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="profile" className="clay-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-[var(--clay-accent-strong)]" />
          <h3 className="text-base font-bold text-[var(--clay-text)]">Profile</h3>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="clay-inset p-3.5">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
              Name
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[var(--clay-text)]">{name}</dd>
          </div>
          <div className="clay-inset p-3.5">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
              Email
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[var(--clay-text)]">{email}</dd>
          </div>
          <div className="clay-inset p-3.5">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
              Role
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[var(--clay-accent-strong)]">
              {role ? roleLabel(role) : '—'}
            </dd>
          </div>
        </dl>
        {role && (
          <Link
            href={roleHome(role)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--clay-accent-strong)] hover:underline"
          >
            Go to my panel
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </section>

      <section id="appearance" className="clay-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-[var(--clay-accent-strong)]" />
          <h3 className="text-base font-bold text-[var(--clay-text)]">Appearance</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.id;
            const Icon = option.id === 'dark' ? Moon : Sun;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? 'border-[color-mix(in_srgb,var(--clay-accent)_45%,transparent)] bg-[var(--clay-accent-soft)] shadow-[var(--clay-shadow-sm)]'
                    : 'border-[var(--clay-line)] bg-[var(--clay-surface-2)] hover:-translate-y-0.5'
                }`}
              >
                <span
                  className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl ${
                    option.id === 'dark'
                      ? 'bg-[#262220] text-[#ecc66f]'
                      : 'bg-[#fbf7f0] text-[#4f7d5a]'
                  } shadow-[var(--clay-shadow-sm)]`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[var(--clay-text)]">
                    {option.label}
                  </span>
                  <span className="block truncate text-xs font-medium text-[var(--clay-muted)]">
                    {option.description}
                  </span>
                </span>
                {active && (
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--clay-accent)] text-[#10231a]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-medium text-[var(--clay-muted)]">
          The choice is stored on this device and applied before first paint to avoid a flash.
        </p>
      </section>

      <section id="diagnostics" className="clay-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--clay-accent-strong)]" />
          <h3 className="text-base font-bold text-[var(--clay-text)]">Diagnostics & logs</h3>
        </div>
        <LogsPanel />
      </section>
    </div>
  );
}
