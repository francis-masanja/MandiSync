'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { installLogCapture, logger } from '@/shared/logger';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installLogCapture();
    logger.info('app', 'Providers mounted');
    // React hydration can reset classes added by the head script; re-apply the
    // hero entrance mark once the client tree is live.
    document.documentElement.classList.add('m-enter');
    const timer = window.setTimeout(
      () => document.documentElement.classList.add('m-enter-done'),
      900
    );
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
