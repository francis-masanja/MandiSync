'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Activity,
  ArrowRight,
  Check,
  Layers,
  Menu,
  QrCode,
  Radio,
  ScanLine,
  ShieldCheck,
  Wheat,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/features/system/ThemeToggle';
import { isUserRole, roleHome } from '@/shared/roles';

const WRAP = 'wrap';
const EYEBROW =
  'text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--clay-text-soft)]';

const FEATURES = [
  {
    icon: QrCode,
    title: 'Book a mandi slot',
    body: 'Farmers reserve a one-hour window, record the crop and weight, and carry a QR pass to the gate.',
    rows: ['One-hour window', 'Crop and weight', 'QR gate pass'],
  },
  {
    icon: ScanLine,
    title: 'Check the gate tag',
    body: 'The gate desk reads the UHF tag, opens the barrier for a valid booking and records the arrival time.',
    rows: ['UHF tag lookup', 'Barrier signal', 'Arrival time'],
  },
  {
    icon: Layers,
    title: 'Record both weights',
    body: 'The weighbridge records gross and tare, calculates the net weight and writes the payout to the ledger.',
    rows: ['Gross weight', 'Tare weight', 'Payout record'],
  },
];

const ROLES = [
  {
    icon: Wheat,
    label: 'Farmer booking panel',
    short: 'Farmer',
    body: 'Book a slot, carry the QR pass and follow the load from gate to payout.',
    points: ['Own bookings', 'QR delivery pass', 'Delivery status', 'Theme and logs'],
  },
  {
    icon: Radio,
    label: 'Gate and queue desk',
    short: 'Gate operator',
    body: 'Check the tag, open the barrier and record both weights at one desk.',
    points: ['Gate check', 'Weighbridge record', 'Queue view', 'Buffer sync'],
  },
  {
    icon: ShieldCheck,
    label: 'Mandi network overview',
    short: 'Administrator',
    body: 'See every mandi, reconcile the queue ledger and inspect runtime logs.',
    points: ['Network view', 'All bookings', 'Diagnostics', 'Role access'],
  },
];

const BOARD = [
  { name: 'Karnal Central', queue: 3, used: 55, tone: 'accent' },
  { name: 'Khanna Grain', queue: 5, used: 72, tone: 'wheat' },
  { name: 'Kota Bhamashah', queue: 2, used: 41, tone: 'clay' },
];

const STATS = [
  {
    value: '4',
    label: 'APMC mandis',
    detail: 'Karnal, Khanna, Kota and Indore',
  },
  {
    value: '2',
    label: 'weighments per load',
    detail: 'gross and tare on one record',
  },
  {
    value: '1',
    label: 'queue ledger',
    detail: 'shared by every mandi desk',
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const rawRole = (session?.user as { role?: string } | undefined)?.role;
  const role = isUserRole(rawRole) ? rawRole : null;
  const home = role ? roleHome(role) : '/login';
  const mainAction = role ? 'Open my workspace' : 'Sign in';

  return (
    <>
      <header className="clay-topbar nav fixed inset-x-0 top-0 z-40">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--clay-surface)] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-[var(--clay-text)] focus:shadow-[var(--clay-shadow)]"
        >
          Skip to content
        </a>
        <div className={`${WRAP} flex h-16 items-center justify-between gap-3`}>
          <Link href="/" className="flex min-h-11 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
              <Wheat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-base font-extrabold tracking-tight text-[var(--clay-text)]">
                MandiSync
              </span>
              <span className="hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--clay-faint)] sm:block">
                APMC workspace
              </span>
            </span>
          </Link>

          <div className="flex flex-none items-center gap-2">
            <Link
              href={home}
              className="clay-btn clay-btn-accent min-h-11 whitespace-nowrap !px-2 !py-2 text-xs sm:!px-4 sm:text-sm"
            >
              {mainAction}
              <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
            </Link>
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="nav__toggle clay-btn clay-btn-ghost min-h-11 min-w-11 !p-2"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle compact />
            </div>
          </div>
        </div>

        {menuOpen && (
          <div id="site-menu" className="clay-card absolute left-4 right-4 top-20 z-50 p-2 lg:hidden">
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--clay-text)] hover:bg-[var(--clay-surface-2)]"
            >
              How the queue works
            </a>
            <a
              href="#roles"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--clay-text)] hover:bg-[var(--clay-surface-2)]"
            >
              Role access
            </a>
            {!role && (
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--clay-text)] hover:bg-[var(--clay-surface-2)]"
              >
                Create account
              </Link>
            )}
            <Link
              href={home}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--clay-accent-strong)] hover:bg-[var(--clay-surface-2)]"
            >
              {mainAction}
            </Link>
          </div>
        )}
      </header>

      <main id="main">
        <section className="hero relative flex min-h-screen items-center" data-enter>
          <div className={WRAP}>
            <div className="hero-text grid w-full items-start gap-6 pb-6 pt-20 sm:py-24 lg:grid-cols-12 lg:gap-6 lg:py-28">
            <div className="lg:col-span-7">
              <span className="clay-chip clay-chip-accent">
                <Wheat className="h-3.5 w-3.5" aria-hidden="true" />
                Mandi operations
              </span>
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.06] tracking-tight text-[var(--clay-text)] sm:text-5xl">
                Mandi queue software for farmers and gate operators
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--clay-text-soft)] sm:text-base">
                One login for 3 mandi roles. Farmers book a slot, operators check the tag
                and record both weights, administrators see every mandi in one queue ledger.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={home} className="clay-btn clay-btn-accent">
                  {mainAction}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/signup" className="clay-btn">
                  Create account
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap justify-between gap-2 sm:justify-start">
                {['Role-based panels', 'Gate and weighbridge records', 'Exportable logs'].map((item) => (
                  <span key={item} className="clay-chip">
                    <Check className="h-3 w-3 text-[var(--clay-accent-strong)]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-visual relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[2.5rem] bg-[var(--clay-accent)] opacity-10 blur-2xl"
              />
              <div
                className="app-frame clay-card card relative overflow-hidden"
                data-visual
                data-ui
                role="img"
                aria-label="MandiSync queue board preview: three mandi queues with daily capacity, and a weighbridge record for a gross weight."
              >
                <div className="flex items-center justify-between border-b border-[var(--clay-line)] px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--clay-text)]">Queue view</p>
                    <p className="text-[11px] font-medium text-[var(--clay-text-soft)]">
                      3 mandis · today
                    </p>
                  </div>
                  <span className="clay-chip clay-chip-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--clay-accent-strong)]" />
                    Preview
                  </span>
                </div>

                <div className="space-y-3 p-5">
                  {BOARD.map((row, index) => (
                    <div
                      key={row.name}
                      className={`clay-inset p-3.5 ${index > 0 ? 'hidden sm:block' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--clay-text)]">{row.name}</p>
                        <span className="text-[11px] font-bold text-[var(--clay-text-soft)]">
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

                  <div className="hidden items-start gap-3 rounded-2xl bg-[var(--clay-ink)] p-3.5 text-[#cfe6d6] lg:flex">
                    <Activity className="mt-0.5 h-4 w-4 flex-none text-[#8fc39b]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">Weighbridge record</p>
                      <p className="mt-0.5 font-mono text-[10px] text-[#93aa9a]">
                        GROSS 2,540 kg · tare pending · UHF-TAG-771920
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section id="features" className="flex min-h-screen scroll-mt-20 items-center max-md:min-h-[200svh]">
          <div className={`${WRAP} py-16`}>
            <div className="max-w-2xl">
              <p className={EYEBROW}>From gate to payout</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--clay-text)] sm:text-3xl">
                Mandi arrivals, slot to payout
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--clay-text-soft)]">
                One record follows each load from the farmer’s booking to the gate, the
                weighbridge and the payout.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
              {FEATURES.map(({ icon: Icon, title, body, rows }) => (
                <div key={title} className="clay-card card flex min-h-[20rem] flex-col p-6 md:col-span-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-[var(--clay-text)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--clay-text-soft)]">{body}</p>
                  <ul className="mt-auto space-y-2 pt-6">
                    {rows.map((row) => (
                      <li
                        key={row}
                        className="flex items-center gap-2 text-xs font-semibold text-[var(--clay-text-soft)]"
                      >
                        <Check className="h-3.5 w-3.5 flex-none text-[var(--clay-accent-strong)]" aria-hidden="true" />
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="card mt-8 overflow-hidden rounded-2xl border border-[var(--clay-line)] p-5"
              data-visual
              data-ui
              role="img"
              aria-label="MandiSync arrival record: slot booked, gate verified, gross 2,540 kg and tare 1,020 kg."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[
                  ['1', 'Slot booked', 'One-hour window'],
                  ['2', 'Gate verified', 'UHF tag read'],
                  ['3', 'Gross weight', '2,540 kg'],
                  ['4', 'Tare weight', '1,020 kg'],
                  ['5', 'Queue position', 'Placed on arrival'],
                  ['6', 'Payout rate', 'Crop rate applied'],
                  ['7', 'Receipt', 'Written to the ledger'],
                  ['8', 'Status', 'Visible to the role'],
                ].map(([step, label, detail], index) => (
                  <div key={label} className={`clay-inset items-center gap-3 p-4 ${index >= 4 ? 'hidden md:flex' : 'flex'}`}>
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--clay-accent)] text-[11px] font-bold text-[#10231a]">
                      {step}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--clay-text)]">{label}</p>
                      <p className="text-[10px] font-medium text-[var(--clay-text-soft)]">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="proof"
          className="flex min-h-screen scroll-mt-20 items-center bg-[var(--clay-ink)] text-[#f4ece0] max-md:min-h-[200svh]"
          data-moment="word-highlight"
        >
          <div className={`${WRAP} py-20`}>
            <div className="max-w-2xl">
              <p className={`${EYEBROW} !text-[#c9b9a8]`}>One ledger</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#f4ece0] sm:text-3xl">
                Mandi operations in numbers
              </h2>
              <p className="mo-wh__text mt-4 max-w-3xl text-[#f4ece0]">
                Every desk reads one record: the arrival time, the two weights and the
                payout. No second sheet, no copied figure, no queue that exists in only
                one office.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-12">
              {STATS.map((stat) => (
                <div key={stat.label} className="border-t border-white/15 pt-6 sm:col-span-4">
                  <p className="t-stat">{stat.value}</p>
                  <p className="mt-3 text-sm font-bold text-[#f4ece0]">{stat.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#c9b9a8]">{stat.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-12">
              {[
                ['Arrival', 'Gate entry time and tag'],
                ['Weight', 'Gross, tare and net'],
                ['Payout', 'Rate and amount'],
              ].map(([label, detail]) => (
                <div key={label} className="border-t border-white/15 pt-3 sm:col-span-4">
                  <p className="text-xs font-bold text-[#f4ece0]">{label}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#c9b9a8]">{detail}</p>
                </div>
              ))}
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ['Gate entry', 'tag and arrival time'],
                ['Gross weight', 'laden vehicle'],
                ['Tare weight', 'empty vehicle'],
                ['Payout', 'net weight × rate'],
                ['Moisture', 'optional reading'],
                ['Device', 'gate or scale node'],
              ].map(([term, detail]) => (
                <div key={term} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-2">
                  <dt className="text-xs font-semibold text-[#f4ece0]">{term}</dt>
                  <dd className="text-right text-[11px] text-[#c9b9a8]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="roles" className="flex min-h-screen scroll-mt-20 items-center max-md:min-h-[200svh]">
          <div className={`${WRAP} py-16`}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
              <div className="md:col-span-7">
                <p className={EYEBROW}>Least privilege by design</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--clay-text)] sm:text-3xl">
                  One login for 3 mandi roles
                </h2>
              </div>
              <p className="text-sm font-medium leading-relaxed text-[var(--clay-text-soft)] md:col-span-5">
                Each role sees the panels and actions it needs, and nothing else.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
              {ROLES.map(({ icon: Icon, label, short, body, points }) => (
                <div key={label} className="clay-card card flex min-h-[20rem] flex-col p-6 md:col-span-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--clay-surface-2)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--clay-text)]">{label}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
                        {short}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--clay-text-soft)]">{body}</p>
                  <ul className="mt-5 space-y-2 border-t border-[var(--clay-line)] pt-4">
                    {points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-xs font-semibold text-[var(--clay-text-soft)]"
                      >
                        <Check className="h-3.5 w-3.5 flex-none text-[var(--clay-accent-strong)]" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="card mt-8 overflow-hidden rounded-2xl border border-[var(--clay-line)]"
              data-visual
              data-ui
              role="img"
              aria-label="Role access matrix: farmers see deliveries and settings; gate operators see the gate, queue and settings; administrators see every area."
            >
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 border-b border-[var(--clay-line)] bg-[var(--clay-surface-2)] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--clay-faint)]">
                <span>Area</span>
                <span>Farmer</span>
                <span>Gate</span>
                <span>Admin</span>
              </div>
              {[
                ['Deliveries', true, false, false],
                ['Gate desk', false, true, true],
                ['Queue ledger', false, true, true],
                ['Settings and logs', true, true, true],
                ['Weighbridge', false, true, true],
                ['Reports', false, true, true],
                ['Users', false, false, true],
                              ].map(([area, farmer, gate, admin]) => (
                <div
                  key={String(area)}
                  className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-[var(--clay-line)] px-4 py-2.5 text-[11px] font-semibold text-[var(--clay-text-soft)] last:border-b-0"
                >
                  <span>{area}</span>
                  <span className={farmer ? 'text-[var(--clay-text)]' : 'text-[var(--clay-text-soft)]'}>
                    {farmer ? 'Yes' : '—'}
                  </span>
                  <span className={gate ? 'text-[var(--clay-text)]' : 'text-[var(--clay-text-soft)]'}>
                    {gate ? 'Yes' : '—'}
                  </span>
                  <span className={admin ? 'text-[var(--clay-text)]' : 'text-[var(--clay-text-soft)]'}>
                    {admin ? 'Yes' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="closing flex min-h-screen items-center border-t border-[var(--clay-line)] max-md:min-h-[200svh]">
        <div className={`${WRAP} py-16`}>
          <div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className={EYEBROW}>Start here</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--clay-text)] sm:text-3xl">
                Open your mandi workspace
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--clay-text-soft)]">
                Sign in with the account your mandi administrator issued. The workspace opens
                the panel your role can use.
              </p>
              <Link href={home} className="clay-btn clay-btn-accent mt-6">
                {mainAction}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="clay-card card p-6 lg:col-span-5">
              <h3 className="text-base font-bold text-[var(--clay-text)]">
                What each mandi role opens
              </h3>
              <ul className="mt-4 space-y-3">
                {['Farmer booking panel', 'Gate and queue desk', 'Mandi network overview'].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-[var(--clay-surface-2)] px-3 py-2 text-xs font-semibold text-[var(--clay-text-soft)]"
                  >
                    <Check className="h-3.5 w-3.5 flex-none text-[var(--clay-accent-strong)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="card mt-10 overflow-hidden rounded-2xl border border-[var(--clay-line)]"
            data-visual
            data-ui
            role="img"
            aria-label="MandiSync workspace preview with a farmer panel, a gate and queue desk and an administrator network view."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {[
                ['Farmer panel', ['Deliveries', 'Slot booking', 'QR pass']],
                ['Gate and queue desk', ['Gate check', 'Queue ledger', 'Weights']],
                ['Network view', ['All mandis', 'All bookings', 'Runtime logs']],
              ].map(([title, rows]) => (
                <div key={String(title)} className="border-b border-[var(--clay-line)] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="text-xs font-bold text-[var(--clay-text)]">{title}</p>
                  <ul className="mt-3 space-y-2">
                    {(rows as string[]).map((row) => (
                      <li
                        key={row}
                        className="rounded-lg bg-[var(--clay-surface-2)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--clay-text-soft)]"
                      >
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-[var(--clay-line)] pt-6 text-left sm:flex-row sm:items-center">
            <p className="text-xs font-semibold text-[var(--clay-text-soft)]">
              MandiSync · APMC workspace
            </p>
            <p className="text-[11px] font-medium text-[var(--clay-text-soft)]">
              Role-based access · gate and weighbridge records · one queue ledger
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
