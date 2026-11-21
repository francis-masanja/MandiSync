# Architecture Overview

MandiSync is a **Next.js 16** (App Router) application built with React 19, TypeScript, and Tailwind CSS 4.

## Layout

- **`src/app/`** – App Router pages, layouts, and thin API routes.
- **`src/features/`** – UI by domain: `farmer`, `gate`, `queue`, `shell`, `system`.
- **`src/server/`** – server-only modules: `db.ts`, `prisma.ts`, `rate-limit.ts`, `auth/`.
- **`src/shared/`** – types, spatial math, audio helpers, role helpers, runtime logger, and zod validation schemas.
- **`src/proxy.ts`** – Next.js 16 proxy (role gate + security headers).
- **`hardware/`** – ESP32 firmware, protocol, and device tooling (not part of the web build).

**Import rule:** `app → features → server/shared`. Feature components never import Prisma or secrets directly.

## Runtime

- Next.js 16 App Router + Turbopack
- React 19 + TypeScript 5.9
- Tailwind CSS 4 + `tw-animate-css`
- Lucide React icons
- QRCode for gate tokens
- NextAuth with file-backed demo users (`data/users.json`)

Devices talk to the telemetry API only. There is no firmware viewer, Web Serial, or virtual hardware bench in the web UI.

## UI, themes, and diagnostics

- **Pure Clay** tokens are defined in `src/app/globals.css` as CSS variables for light and dark.
  `tailwind.config.ts` exposes matching `clay-*` colors, and a compatibility layer under
  `.clay-app` remaps legacy panel utilities (`bg-white`, `bg-slate-*`, `bg-glass`, …) to clay
  surfaces. Feature components therefore inherit both themes without per-component rewrites.
- **Theme** is persisted in `localStorage['mandisync.theme']` and applied by an inline script in
  `src/app/layout.tsx` before first paint. `ThemeProvider` uses `useSyncExternalStore` so the
  toggle, Settings page, and cross-tab storage events stay in sync.
- **Session** is provided by `SessionProvider` in `Providers.tsx`; navigation filters items from
  `src/shared/roles.ts` so a role never sees another role's panel. `/admin` is admin-only and
  `/settings` is available to every authenticated role.
- **Logging** is a 500-entry ring buffer in `localStorage['mandisync.logs.v1']`. Debug entries are
  only recorded when verbose mode is on; warnings and errors are always recorded. Global
  `error`, `unhandledrejection`, and wrapped `fetch` failures are captured automatically and the
  buffer is viewable and exportable from `/settings`.
- **Auth rate limiting** applies only to `POST /api/auth/callback/credentials`; read-only
  session/CSRF/provider lookups are never throttled.
