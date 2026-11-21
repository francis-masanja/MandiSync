'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Bug, ChevronDown, Download, ScrollText, Trash2 } from 'lucide-react';
import {
  clearLogs,
  exportLogs,
  getLogs,
  getServerLogs,
  getServerVerbose,
  isVerbose,
  logger,
  setVerbose,
  subscribe,
  type LogEntry,
  type LogLevel,
} from '@/shared/logger';
import { ClaySwitch } from './ClaySwitch';

const LEVELS: Array<{ id: LogLevel | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'debug', label: 'Debug' },
  { id: 'info', label: 'Info' },
  { id: 'warn', label: 'Warn' },
  { id: 'error', label: 'Error' },
];

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'bg-[var(--clay-surface-3)] text-[var(--clay-muted)]',
  info: 'bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)]',
  warn: 'bg-[color-mix(in_srgb,var(--clay-wheat)_24%,transparent)] text-[color-mix(in_srgb,var(--clay-wheat)_70%,var(--clay-text))]',
  error: 'bg-[color-mix(in_srgb,var(--clay-danger)_18%,transparent)] text-[var(--clay-danger)]',
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function LogsPanel() {
  const entries = useSyncExternalStore(subscribe, getLogs, getServerLogs);
  const verbose = useSyncExternalStore(subscribe, isVerbose, getServerVerbose);
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((entry) => (level === 'all' ? true : entry.level === level))
      .filter((entry) => (q ? `${entry.scope} ${entry.message}`.toLowerCase().includes(q) : true))
      .slice()
      .reverse();
  }, [entries, level, query]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: entries.length, debug: 0, info: 0, warn: 0, error: 0 };
    entries.forEach((entry) => {
      base[entry.level] += 1;
    });
    return base;
  }, [entries]);

  const handleExport = () => {
    const payload = exportLogs();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mandisync-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    logger.info('logs', 'Logs exported', { entries: entries.length });
  };

  return (
    <div className="space-y-5">
      <div className="clay-inset flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--clay-surface)] text-[var(--clay-accent-strong)] shadow-[var(--clay-shadow-sm)]">
            <Bug className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--clay-text)]">Verbose logging</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--clay-muted)]">
              Capture debug-level runtime events. Warnings and errors are always recorded.
            </p>
          </div>
        </div>
        <div className="sm:w-64">
          <ClaySwitch
            checked={verbose}
            onChange={setVerbose}
            label="Verbose mode"
            description={`${entries.length} / 500 entries buffered`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLevel(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                level === item.id
                  ? 'bg-[var(--clay-accent-soft)] text-[var(--clay-accent-strong)] shadow-[var(--clay-inset)]'
                  : 'bg-[var(--clay-surface-2)] text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[item.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleExport} className="clay-btn !px-3 !py-2 text-xs" aria-label="Export logs">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" onClick={clearLogs} className="clay-btn clay-btn-ghost !px-3 !py-2 text-xs text-[var(--clay-danger)]" aria-label="Clear logs">
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search scope or message…"
        className="clay-input"
        aria-label="Search logs"
      />

      <div className="clay-inset max-h-[26rem] overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <ScrollText className="h-8 w-8 text-[var(--clay-faint)]" />
            <p className="text-sm font-semibold text-[var(--clay-text)]">No log entries</p>
            <p className="max-w-xs text-xs text-[var(--clay-muted)]">
              {verbose
                ? 'Interact with the app and debug events will appear here.'
                : 'Turn on verbose mode to capture debug events, or watch for warnings and errors.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((entry: LogEntry) => {
              const open = expanded === entry.id;
              return (
                <li key={entry.id} className="rounded-xl bg-[var(--clay-surface)] p-2.5 shadow-[var(--clay-shadow-sm)]">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : entry.id)}
                    className="flex w-full items-start gap-2 text-left"
                    aria-expanded={open}
                  >
                    <span
                      className={`mt-0.5 flex-none rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${LEVEL_STYLES[entry.level]}`}
                    >
                      {entry.level}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[11px] font-bold text-[var(--clay-text)]">
                          {entry.scope}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--clay-faint)]">
                          {formatTime(entry.ts)}
                        </span>
                      </span>
                      <span className="mt-0.5 block break-words text-xs text-[var(--clay-muted)]">
                        {entry.message}
                      </span>
                    </span>
                    {entry.data !== undefined && (
                      <ChevronDown
                        className={`h-4 w-4 flex-none text-[var(--clay-faint)] transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {open && entry.data !== undefined && (
                    <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-[var(--clay-ink)] p-2.5 text-[10px] leading-relaxed text-[#cfe6d6]">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
