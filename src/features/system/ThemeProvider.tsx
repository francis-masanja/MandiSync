'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { logger } from '@/shared/logger';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'mandisync.theme';
const listeners = new Set<() => void>();

let currentTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getThemeSnapshot(): Theme {
  if (currentTheme === null) currentTheme = readStoredTheme();
  return currentTheme;
}

function getServerTheme(): Theme {
  return 'light';
}

function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(theme: Theme) {
  currentTheme = theme;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerTheme);

  useEffect(() => {
    applyTheme(getThemeSnapshot());

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        applyTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    if (getThemeSnapshot() === next) return;
    logger.info('theme', `Theme set to ${next}`);
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = getThemeSnapshot() === 'dark' ? 'light' : 'dark';
    logger.info('theme', `Theme toggled to ${next}`);
    applyTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
