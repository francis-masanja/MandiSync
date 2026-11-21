'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light clay theme' : 'Switch to dark clay theme'}
      title={isDark ? 'Light clay' : 'Dark clay'}
      className={`clay-toggle ${compact ? 'clay-toggle-compact' : ''}`}
    >
      <span className="clay-toggle-knob" data-active={isDark}>
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      {!compact && (
        <span className="clay-toggle-label">{isDark ? 'Dark clay' : 'Light clay'}</span>
      )}
    </button>
  );
}
