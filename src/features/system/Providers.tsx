'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { installLogCapture, logger } from '@/shared/logger';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installLogCapture();
    logger.info('app', 'Providers mounted');
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
