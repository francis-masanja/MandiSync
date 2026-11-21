'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ArrowRight, LogOut, ShieldAlert, Wheat } from 'lucide-react';
import { roleHome, roleLabel, type UserRole } from '@/shared/roles';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const rawRole = (session?.user as { role?: string } | undefined)?.role;
  const role: UserRole | null =
    rawRole === 'farmer' || rawRole === 'operator' || rawRole === 'admin' ? rawRole : null;

  return (
    <main className="clay-bg flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="clay-card w-full max-w-md overflow-hidden">
        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center sm:px-8">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--clay-danger)_14%,transparent)] text-[var(--clay-danger)] shadow-[var(--clay-shadow-sm)]">
            <ShieldAlert className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
            Not your panel
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--clay-muted)]">
            Your account does not have permission to open this page. MandiSync only shows the panels
            and actions granted to your role.
          </p>

          {role && (
            <span className="clay-chip clay-chip-accent mt-4">
              <Wheat className="h-3.5 w-3.5" />
              Signed in as {roleLabel(role)}
            </span>
          )}
        </div>

        <div className="space-y-2 border-t border-[var(--clay-line)] bg-[var(--clay-surface-2)]/60 p-5 sm:p-6">
          {role ? (
            <Link href={roleHome(role)} className="clay-btn clay-btn-accent w-full !py-3">
              Open my panel
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/login" className="clay-btn clay-btn-accent w-full !py-3">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="clay-btn w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
