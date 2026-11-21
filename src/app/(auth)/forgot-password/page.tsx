'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react';
import { logger } from '@/shared/logger';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    logger.info('auth', 'Password reset requested', { email });
    window.setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="clay-card overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
          <KeyRound className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
          Reset password
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--clay-muted)]">
          We will send a reset link if the address is registered.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-[var(--clay-accent-soft)] p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[var(--clay-accent-strong)]" />
            <div>
              <p className="text-sm font-bold text-[var(--clay-text)]">Check your inbox</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--clay-muted)]">
                If <span className="font-semibold">{email}</span> exists in the system, a reset link
                has been sent. The link expires shortly.
              </p>
            </div>
          </div>
          <Link href="/login" className="clay-btn w-full">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--clay-faint)]" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="clay-input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="clay-btn clay-btn-accent w-full !py-3">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--clay-muted)] transition-colors hover:text-[var(--clay-text)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
