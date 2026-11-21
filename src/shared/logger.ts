export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  ts: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
}

const LOG_KEY = 'mandisync.logs.v1';
const VERBOSE_KEY = 'mandisync.verbose.v1';
const MAX_ENTRIES = 500;
const EVENT = 'mandisync:logs-changed';

const hasWindow = () => typeof window !== 'undefined';

const listeners = new Set<() => void>();

const readVerbose = (): boolean => {
  if (!hasWindow()) return false;
  try {
    return window.localStorage.getItem(VERBOSE_KEY) === 'true';
  } catch {
    return false;
  }
};

let verbose = readVerbose();
let captured = false;
let cache: LogEntry[] | null = null;
const EMPTY_LOGS: LogEntry[] = [];

export const getServerLogs = (): LogEntry[] => EMPTY_LOGS;
export const getServerVerbose = (): boolean => false;

function emitChange() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* listener errors must never break logging */
    }
  });
  if (hasWindow()) window.dispatchEvent(new CustomEvent(EVENT));
}

function readLogs(): LogEntry[] {
  if (cache) return cache;
  if (!hasWindow()) return EMPTY_LOGS;
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    if (!raw) {
      cache = EMPTY_LOGS;
      return cache;
    }
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed) ? (parsed as LogEntry[]) : EMPTY_LOGS;
    return cache;
  } catch {
    cache = EMPTY_LOGS;
    return cache;
  }
}

function writeLogs(entries: LogEntry[]) {
  const trimmed = entries.slice(-MAX_ENTRIES);
  cache = trimmed;
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage may be full or blocked; logging must stay best-effort */
  }
}

function makeId(): string {
  if (hasWindow() && 'crypto' in window && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function record(level: LogLevel, scope: string, message: string, data?: unknown) {
  if (level === 'debug' && !verbose) return;

  const entry: LogEntry = {
    id: makeId(),
    ts: Date.now(),
    level,
    scope,
    message,
    data,
  };

  const next = [...readLogs(), entry].slice(-MAX_ENTRIES);
  writeLogs(next);

  if (verbose || level === 'warn' || level === 'error') {
    const line = `[${scope}] ${message}`;
    const method = level === 'debug' ? 'debug' : level === 'info' ? 'info' : level;
    const fn = console[method] as (...args: unknown[]) => void;
    if (typeof fn === 'function') {
      if (data !== undefined) fn(line, data);
      else fn(line);
    }
  }

  emitChange();
}

export const logger = {
  debug: (scope: string, message: string, data?: unknown) => record('debug', scope, message, data),
  info: (scope: string, message: string, data?: unknown) => record('info', scope, message, data),
  warn: (scope: string, message: string, data?: unknown) => record('warn', scope, message, data),
  error: (scope: string, message: string, data?: unknown) => record('error', scope, message, data),
};

export function getLogs(): LogEntry[] {
  return readLogs();
}

export function clearLogs() {
  writeLogs([]);
  logger.info('logs', 'Log buffer cleared');
  emitChange();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isVerbose(): boolean {
  return verbose;
}

export function setVerbose(next: boolean) {
  verbose = next;
  if (hasWindow()) {
    try {
      window.localStorage.setItem(VERBOSE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }
  logger.info('logs', next ? 'Verbose logging enabled' : 'Verbose logging disabled');
  emitChange();
}

export function exportLogs(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      verbose,
      entries: readLogs(),
    },
    null,
    2
  );
}

/** Install global capture for uncaught errors, rejected promises, and failed fetches. */
export function installLogCapture() {
  if (!hasWindow() || captured) return;
  captured = true;

  window.addEventListener('error', (event) => {
    logger.error('window', event.message || 'Uncaught error', {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logger.error('window', 'Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const started = Date.now();

    try {
      const response = await originalFetch(input, init);
      const ms = Date.now() - started;
      if (response.ok) {
        logger.debug('fetch', `${method} ${url} → ${response.status} (${ms}ms)`);
      } else {
        logger.warn('fetch', `${method} ${url} → ${response.status} (${ms}ms)`);
      }
      return response;
    } catch (error) {
      logger.error('fetch', `Network failure ${method} ${url}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  logger.info('app', 'Runtime logger initialised');
}
