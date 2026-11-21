'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Activity,
  ArrowRight,
  Check,
  Layers,
  QrCode,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wheat,
} from 'lucide-react';
import { ThemeToggle } from '@/features/system/ThemeToggle';
import { isUserRole, roleHome, roleLabel } from '@/shared/roles';

const FEATURES = [
  {
    icon: QrCode,
    title: 'Slot booking & QR pass',
    body: 'Farmers reserve a mandi window and carry a scannable pass — no paper tokens, no crowding at the gate.',
  },
  {
    icon: ScanLine,
    title: 'RFID gate + weighbridge',
    body: 'UHF tags verify arrivals, the bridge captures gross and tare, and offline buffers reconcile when the link returns.',
  },
  {
    icon: Layers,
    title: 'Ledger & diagnostics',
    body: 'Operators keep the queue moving while administrators audit every mandi and export verbose runtime logs.',
  },
];

const ROLES = [
  {
    icon: Wheat,
    label: 'Farmer',
    body: 'Book slots, carry your pass, and follow the delivery from gate to payout.',
    points: ['Own bookings only', 'QR delivery pass', 'Live status'],
  },
  {
    icon: Radio,
    label: 'Gate Operator',
    body: 'Verify arrivals, capture weights, and reconcile the queue from one desk.',
    points: ['Gate desk', 'Queue ledger', 'Weighbridge sync'],
  },
  {
    icon: ShieldCheck,
    label: 'Administrator',
    body: 'See the whole network, step into any desk, and inspect diagnostics.',
    points: ['Network overview', 'All mandis', 'Runtime logs'],
  },
];

const BOARD = [
  { name: 'Karnal Central', queue: 3, used: 55, tone: 'accent' },
  { name: 'Khanna Grain', queue: 5, used: 72, tone: 'wheat' },
  { name: 'Kota Bhamashah', queue: 2, used: 41, tone: 'clay' },
];

export default function HomePage() {
  const { data: session } = useSession();
  const rawRole = (session?.user as { role?: string } | undefined)?.role;
  const role = isUserRole(rawRole) ? rawRole : null;

  return (
    <div className="clay-bg min-h-screen">
      <header className="clay-topbar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
              <Wheat className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight text-[var(--clay-text)]">
                MandiSync
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--clay-faint)]">
                APMC workspace
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            {role ? (
              <Link href={roleHome(role)} className="clay-btn clay-btn-accent !px-4 !py-2 text-xs sm:text-sm">
                Open my workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/login" className="clay-btn clay-btn-accent !px-4 !py-2 text-xs sm:text-sm">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="clay-chip clay-chip-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Pure clay interface · light & dark
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--clay-text)] sm:text-5xl">
              Queue less.
              <br />
              <span className="text-[var(--clay-accent-strong)]">Weigh once.</span> Move more.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--clay-muted)]">
              MandiSync connects farmer bookings, RFID gate verification, and weighbridge telemetry
              into one calm workspace for every role at the mandi.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {role ? (
                <Link href={roleHome(role)} className="clay-btn clay-btn-accent">
                  Continue as {roleLabel(role)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/login" className="clay-btn clay-btn-accent">
                  Sign in to your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <a href="#roles" className="clay-btn">
                See role access
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {['Role-based panels', 'Offline-safe buffers', 'Exportable logs'].map((item) => (
                <span key={item} className="clay-chip">
                  <Check className="h-3 w-3 text-[var(--clay-accent-strong)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2.5rem] bg-[var(--clay-accent)] opacity-10 blur-2xl"
            />
            <div className="clay-card relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--clay-line)] px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-[var(--clay-text)]">Live queue board</p>
                  <p className="text-[11px] font-medium text-[var(--clay-muted)]">
                    Three mandis · today
                  </p>
                </div>
                <span className="clay-chip clay-chip-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--clay-accent-strong)]" />
                  Realtime
                </span>
              </div>

              <div className="space-y-3 p-5">
                {BOARD.map((row) => (
                  <div key={row.name} className="clay-inset p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--clay-text)]">{row.name}</p>
                      <span className="text-[11px] font-bold text-[var(--clay-muted)]">
                        {row.queue} in queue
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--clay-surface-3)] shadow-[var(--clay-inset)]">
                      <div
                        className={`h-full rounded-full ${
                          row.tone === 'wheat'
                            ? 'bg-[linear-gradient(90deg,var(--clay-wheat),color-mix(in_srgb,var(--clay-wheat)_70%,#8a5a14))]'
                            : row.tone === 'clay'
                              ? 'bg-[linear-gradient(90deg,var(--clay-clay),color-mix(in_srgb,var(--clay-clay)_70%,#7a3f24))]'
                              : 'bg-[linear-gradient(90deg,var(--clay-accent),var(--clay-accent-strong))]'
                        }`}
                        style={{ width: `${row.used}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] font-medium text-[var(--clay-faint)]">
                      {row.used}% daily capacity allocated
                    </p>
                  </div>
                ))}

                <div className="flex items-start gap-3 rounded-2xl bg-[var(--clay-ink)] p-3.5 text-[#cfe6d6]">
                  <Activity className="mt-0.5 h-4 w-4 flex-none text-[#8fc39b]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Weighbridge event captured</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#93aa9a]">
                      GROSS 2,540 kg · tare pending · UHF-TAG-771920
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="clay-card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-[var(--clay-text)]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--clay-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="roles" className="mt-16 scroll-mt-24">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--clay-faint)]">
                Least privilege by design
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
                One login. Only your panel.
              </h2>
            </div>
            <p className="max-w-md text-sm font-medium text-[var(--clay-muted)]">
              Panels, navigation, and API routes are filtered by role — nothing else is exposed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {ROLES.map(({ icon: Icon, label, body, points }) => (
              <div key={label} className="clay-card flex flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--clay-surface-2)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-bold text-[var(--clay-text)]">{label}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--clay-muted)]">{body}</p>
                <ul className="mt-3 space-y-1.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-1.5 text-xs font-medium text-[var(--clay-text-soft)]">
                      <Check className="h-3.5 w-3.5 text-[var(--clay-accent-strong)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="clay-raised mt-16 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--clay-text)]">
              Ready when the first truck arrives.
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--clay-muted)]">
              Sign in and MandiSync opens the panel your role is allowed to use.
            </p>
          </div>
          <Link href={role ? roleHome(role) : '/login'} className="clay-btn clay-btn-accent">
            {role ? 'Open my workspace' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-[var(--clay-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-xs font-semibold text-[var(--clay-muted)]">
            MandiSync · Built for APMC mandis
          </p>
          <p className="text-[11px] font-medium text-[var(--clay-faint)]">
            Role-based access · local-first telemetry · v3.0 Pure Clay
          </p>
        </div>
      </footer>
    </div>
  );
}
