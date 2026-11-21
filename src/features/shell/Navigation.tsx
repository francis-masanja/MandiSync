'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BookOpen,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings,
  ShieldCheck,
  UserRound,
  Wheat,
} from 'lucide-react';
import { ThemeToggle } from '@/features/system/ThemeToggle';
import { RoleGuide } from '@/features/system/RoleGuide';
import { isUserRole, roleLabel, type UserRole } from '@/shared/roles';

interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Overview',
    hint: 'All mandis and bookings',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    href: '/farmer',
    label: 'My Deliveries',
    hint: 'Bookings, slots and pass',
    icon: Wheat,
    roles: ['farmer'],
  },
  {
    href: '/gate',
    label: 'Gate Desk',
    hint: 'Arrivals and weighbridge',
    icon: Radio,
    roles: ['operator', 'admin'],
  },
  {
    href: '/queue',
    label: 'Queue Ledger',
    hint: 'Every booking, live',
    icon: Layers,
    roles: ['operator', 'admin'],
  },
  {
    href: '/settings',
    label: 'Settings & Logs',
    hint: 'Theme and diagnostics',
    icon: Settings,
    roles: ['farmer', 'operator', 'admin'],
  },
];

const matches = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const rawRole = (session?.user as { role?: string } | undefined)?.role;
  const role: UserRole | undefined = isUserRole(rawRole) ? rawRole : undefined;

  const items = useMemo(
    () => (role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : []),
    [role]
  );

  const current = items.find((item) => matches(pathname, item.href));
  const pageTitle = current?.label ?? (role ? roleLabel(role) : 'Workspace');
  const pageHint = current?.hint ?? 'Role-based agricultural workspace';

  const name = session?.user?.name ?? 'Signed in';
  const email = session?.user?.email ?? '';
  const initial = name.trim().charAt(0).toUpperCase() || 'M';
  const roleChip = roleLabel(role);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="clay-nav fixed inset-y-0 left-0 z-50 hidden w-72 flex-col lg:flex"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-6 pb-4 pt-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
            <Wheat className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[var(--clay-text)]">MandiSync</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--clay-faint)]">
              APMC workspace
            </p>
          </div>
        </div>

        <div className="mx-6 mb-5 flex items-center justify-between rounded-2xl bg-[var(--clay-surface-2)] px-3 py-2 shadow-[var(--clay-inset)]">
          <span className="flex items-center gap-2 text-xs font-bold text-[var(--clay-accent-strong)]">
            <ShieldCheck className="h-4 w-4" />
            {roleChip}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--clay-faint)]">
            Least privilege
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3" aria-label="Main menu">
          {status === 'loading'
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-2xl bg-[var(--clay-surface-2)]/70"
                />
              ))
            : items.map(({ href, label, hint, icon: Icon }) => {
                const active = matches(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-active={active}
                    aria-current={active ? 'page' : undefined}
                    className="clay-nav-item"
                  >
                    <span
                      className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                        active
                          ? 'bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]'
                          : 'bg-[var(--clay-surface-2)] text-[var(--clay-muted)]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate">{label}</span>
                      <span className="block truncate text-[11px] font-medium text-[var(--clay-faint)]">
                        {hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
        </nav>

        <div className="mt-4 space-y-3 px-4 pb-6">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="clay-btn w-full justify-start"
            disabled={!role}
          >
            <BookOpen className="h-4 w-4" />
            Role guide
          </button>
          <p className="px-1 text-center text-[11px] font-medium text-[var(--clay-faint)]">
            MandiSync v3.0 · Pure Clay
          </p>
        </div>
      </aside>

      {/* Top bar */}
      <header className="clay-topbar sticky top-0 z-40 lg:ml-72">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] lg:hidden">
              <Wheat className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[var(--clay-text)] sm:text-lg">
                {pageTitle}
              </h1>
              <p className="hidden truncate text-xs font-medium text-[var(--clay-muted)] sm:block">
                {pageHint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <span className="hidden rounded-full border border-[var(--clay-line)] bg-[var(--clay-surface-2)] px-3 py-1 text-[11px] font-bold text-[var(--clay-accent-strong)] md:inline">
              {roleChip}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-2xl px-1.5 py-1.5 transition-colors hover:bg-[var(--clay-surface-2)]"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="clay-avatar h-9 w-9 rounded-xl text-sm font-bold">{initial}</span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-[10rem] truncate text-sm font-semibold text-[var(--clay-text)]">
                    {name}
                  </span>
                  <span className="block text-[11px] font-medium text-[var(--clay-faint)]">
                    {roleChip}
                  </span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-[var(--clay-muted)] md:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="clay-card absolute right-0 z-50 mt-2 w-64 overflow-hidden p-2">
                    <div className="rounded-2xl bg-[var(--clay-surface-2)] px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-[var(--clay-text)]">{name}</p>
                      <p className="truncate text-[11px] font-medium text-[var(--clay-muted)]">
                        {email}
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--clay-muted)] transition-colors hover:bg-[var(--clay-surface-2)] hover:text-[var(--clay-text)]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings & logs
                    </Link>
                    <Link
                      href="/settings#profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--clay-muted)] transition-colors hover:bg-[var(--clay-surface-2)] hover:text-[var(--clay-text)]"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--clay-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--clay-danger)_12%,transparent)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 lg:hidden">
        <nav className="clay-bottomnav flex items-stretch gap-1 p-1.5" aria-label="Mobile navigation">
          {items.map(({ href, label, icon: Icon }) => {
            const active = matches(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition-colors ${
                  active
                    ? 'bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]'
                    : 'text-[var(--clay-muted)]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {role && <RoleGuide role={role} open={guideOpen} onClose={() => setGuideOpen(false)} />}
    </>
  );
}
