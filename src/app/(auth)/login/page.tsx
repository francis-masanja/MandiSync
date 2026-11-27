'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn, ShieldCheck, Wheat } from 'lucide-react';
import { logger } from '@/shared/logger';
import { roleHome } from '@/shared/roles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    logger.info('auth', 'Sign-in attempt', { email });

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        ...(remember && { maxAge: 60 * 60 * 24 * 30 }),
      });

      if (result?.error) {
        logger.warn('auth', 'Sign-in rejected', { email, error: result.error });
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      const session = await (await fetch('/api/auth/session')).json();
      const role = session?.user?.role as string | undefined;
      const destination = roleHome(role);
      logger.info('auth', 'Sign-in succeeded', { email, role, destination });
      router.replace(destination);
      router.refresh();
    } catch (err) {
      logger.error('auth', 'Sign-in failed with an exception', {
        error: err instanceof Error ? err.message : String(err),
      });
      setError('Unexpected error while signing in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="clay-card overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
          <Wheat className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--clay-muted)]">
          Sign in to your MandiSync workspace
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--clay-danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--clay-danger)_12%,transparent)] px-3 py-2.5 text-sm font-medium text-[var(--clay-danger)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="clay-input"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[var(--clay-accent-strong)] hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="clay-input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--clay-muted)] transition-colors hover:text-[var(--clay-text)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--clay-muted)]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--clay-line)] text-[var(--clay-accent-strong)] focus:ring-[var(--clay-accent)]"
          />
          Keep me signed in for 30 days
        </label>

        <button type="submit" disabled={loading} className="clay-btn clay-btn-accent w-full !py-3">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs font-medium text-[var(--clay-muted)]">
        New to MandiSync?{' '}
        <Link href="/signup" className="font-bold text-[var(--clay-accent-strong)] hover:underline">
          Create a farmer account
        </Link>
      </p>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--clay-surface-2)] px-3 py-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[var(--clay-accent-strong)]" />
        <p className="text-[11px] leading-relaxed text-[var(--clay-muted)]">
          Your role decides which panels load. Farmers see deliveries, operators see the gate and
          queue, administrators see the network overview. Accounts are provisioned by your mandi
          administrator.
        </p>
      </div>

      <Link
        href="/"
        className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--clay-muted)] transition-colors hover:text-[var(--clay-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>
    </div>
  );
}
