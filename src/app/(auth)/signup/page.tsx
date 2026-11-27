'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserPlus,
  Wheat,
} from 'lucide-react';
import { logger } from '@/shared/logger';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for the password.');
      return;
    }

    setLoading(true);
    logger.info('auth', 'Sign-up attempt', { email });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data?.error === 'string'
            ? data.error
            : 'Could not create the account. Please try again.'
        );
        setLoading(false);
        return;
      }

      setCreated(true);
      logger.info('auth', 'Sign-up succeeded', { email });

      const result = await signIn('credentials', {
        redirect: false,
        email: data.user.email,
        password,
      });

      if (result?.error) {
        router.replace('/login?registered=1');
        return;
      }

      router.replace('/farmer');
      router.refresh();
    } catch (err) {
      logger.error('auth', 'Sign-up failed with an exception', {
        error: err instanceof Error ? err.message : String(err),
      });
      setError('Unexpected error while creating the account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="clay-card overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
          <Wheat className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--clay-text)]">
          Create a farmer account
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--clay-muted)]">
          Book mandi slots and carry your delivery pass.
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

      {created && !error ? (
        <div className="flex items-start gap-3 rounded-2xl bg-[var(--clay-accent-soft)] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[var(--clay-accent-strong)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-[var(--clay-text)]">Account created</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--clay-muted)]">
              Opening your farmer workspace…
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="clay-input"
            />
          </div>

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
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
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

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--clay-muted)]">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat the password"
              className="clay-input"
            />
          </div>

          <button type="submit" disabled={loading || created} className="clay-btn clay-btn-accent w-full !py-3">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--clay-surface-2)] px-3 py-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[var(--clay-accent-strong)]" aria-hidden="true" />
        <p className="text-[11px] leading-relaxed text-[var(--clay-muted)]">
          Farmer accounts are self-service. Gate operator and administrator accounts are issued by
          your mandi administrator.
        </p>
      </div>

      <p className="mt-4 text-center text-xs font-medium text-[var(--clay-muted)]">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[var(--clay-accent-strong)] hover:underline">
          Sign in
        </Link>
      </p>

      <Link
        href="/"
        className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--clay-muted)] transition-colors hover:text-[var(--clay-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>
    </div>
  );
}
