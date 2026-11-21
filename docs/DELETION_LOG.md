# Code Deletion & Cleanup Log

## [2026-11-19] Refactor Session

Scope: `./` (Next.js 16 / React 19 / TypeScript app).

### Unused Dependencies Removed

| Package | Reason |
| --- | --- |
| `@hookform/resolvers` | No `react-hook-form` usage anywhere. |
| `autoprefixer` | Not referenced by `postcss.config.mjs`; Tailwind v4 handles prefixing. |
| `class-variance-authority` | No imports. |
| `clsx` | Only used by the deleted `lib/utils.ts`. |
| `motion` | No imports; removed from `next.config.ts` `transpilePackages` too. |
| `tailwind-merge` | Only used by the deleted `lib/utils.ts`. |

### Dependency Added

- `zod@^4.6.5` — `lib/validation/telemetry.ts` imported `zod` but it was only available
  transitively (through `@hookform/resolvers`). It is now a direct runtime dependency.

### Unused Files Deleted

| File | Reason |
| --- | --- |
| `lib/ai.ts` | Exported Ollama helpers with no callers. |
| `lib/env.ts` | Only consumed by the deleted `lib/ai.ts`. |
| `lib/crypto.ts` | HMAC helpers with no callers; also triggered the old `prebuild` file read. |
| `lib/firmware.ts` | 380-line firmware string never imported; `FirmwareView` embeds its own copy. |
| `lib/web-serial.ts` | Web Serial helper with no callers. |
| `lib/utils.ts` | `cn()` helper with no callers. |
| `hooks/useCurrentUser.ts` | Never imported. |
| `hooks/use-mobile.ts` | Never imported. |
| `app/api/debug/env/route.ts` | Debug endpoint; leaked environment metadata. |
| `app/api/test-db/route.ts` | Unused debug endpoint. |
| `app/api/test-db-direct/route.ts` | Unused debug endpoint. |
| `app/api/test-db-tables/route.ts` | Unused debug endpoint. |
| `app/api/test-prisma/route.ts` | Unused debug endpoint. |
| `app/api/test-prisma-direct/route.ts` | Unused debug endpoint. |
| `app/api/test-prisma-fixed/route.ts` | Unused debug endpoint. |
| `npm_audit_logs.log` | Committed tool output. |
| `npm_install_logs.log` | Committed tool output. |
| `tsconfig.tsbuildinfo` | Build artifact; added to `.gitignore`. |
| `scripts/ca2/__pycache__/` | Python bytecode artifacts; added `__pycache__/` to `.gitignore`. |
| `.eslintrc.json` | Legacy ESLint config ignored by ESLint 9 flat config. |

### Duplicate Code Consolidated

- **Auth rate limiter** duplicated the in-memory limiter from `lib/rate-limit.ts`.
  The auth route now reuses `InMemoryRateLimiter` and `getRateLimitHeaders`.
- **Request rate-limit boilerplate** was repeated in three telemetry routes.
  Added `getRequestRateLimit(request)` in `lib/rate-limit.ts`.
- **`parseDatabaseUrl`** was copy-pasted in six deleted debug routes; no longer needed.
- **Prisma compatibility exports** (`booking`, `telemetryLog`, `mandi`) in `lib/db.ts`
  had no importers and were removed.

### Unused Exports Removed

- `lib/db.ts`: `booking`, `telemetryLog`, `mandi`, and `BookingFilters`.
- `lib/prisma.ts`: `getClient()`.
- `lib/roles.ts`: `Permissions` is now module-private (still used by `hasPermission`).
- `lib/users.ts`: `findUserById()` removed; `loadUsers()` and `User` are now private.

### Structural Fixes / Restructure

- `app/(demo)/page.tsx` → `app/demo/page.tsx`: the old route group resolved to `/`
  and collided with `app/page.tsx`, so `/demo` 404'd. The demo route now builds.
- `app/middleware.ts` → `proxy.ts`: middleware was never loaded from `app/`; it is now
  the root Next.js 16 proxy and actually runs.
- `proxy.ts` now allowlists public paths (`/`, `/demo`, `/login`, `/forgot-password`,
  `/unauthorized`) and returns JSON `401`/`403` for API calls instead of HTML redirects.
- Wired the legacy `tailwind.config.ts` with `@config` in `app/globals.css`; renamed
  custom colors to kebab-case and added `primary`, fixing the previously-missing
  `bg-primary`, `bg-primary-glass`, and `bg-secondary-glass` classes.
- `dev-scripts/seed-turso.ts` → `scripts/seed-turso.ts` for a single scripts location.
- Login: minimum password length lowered from 12 to 8 to match the seeded demo users;
  operator/admin redirects now go to existing pages (`/gate`, `/queue`).
- Fixed API payload casing in `GateControlDesk` and `HardwareBench` to match Zod schemas.
- Relaxed `booking_id` validation so demo IDs (e.g. `BK-2026-001`) are accepted.
- Added `await` for `createBooking` / `resetDemoData` and awaited slot lookups in the
  mandis route; added admin authorization inside `/api/v1/reset`.
- Removed the broken `npm test` step from CI (no test script exists yet).
- `Navigation`: removed the unreachable nested sub-menu machinery (the expand
  handler was never wired) and non-existent Profile/Settings/Help links; wired
  Logout to `signOut()`.
- Updated `docs/reference/api.md`, `README.md`, `docs/guides/SECRETS.md`, and `.env.example` to match
  the current routes, scripts, and `DATABASE_URL` contract.

### Impact

- Files deleted or relocated: 24
- Dependencies removed: 6
- Net diff: ~300 insertions / ~2,000+ deletions
- Debug attack surface removed from the production route list

### Testing

- `npm run type-check` — pass
- `npm run lint` — pass (ESLint flat config now actually lints TS/TSX)
- `npm run build` — pass; route list now includes `/demo` and excludes all debug/test APIs
- Dev + production smoke tests:
  - `/`, `/demo`, `/login` return 200 without auth
  - `/farmer` redirects to `/login?callbackUrl=/farmer` without auth
  - `/api/v1/mandis` returns JSON `401` without auth
  - farmer login works; `/farmer` 200; `/gate` redirects to `/unauthorized`
  - operator login works; `/api/v1/mandis`, `/api/v1/queue/status`, gate-verify, and
    weighbridge accept the corrected snake_case payloads
  - admin login works; `/api/v1/reset` 200; farmer reset 403

### Remaining (manual review / out of scope)

- `TURSO_*` env vars are set, but the data layer still keys off `DATABASE_URL`.
  The app silently uses the in-memory fallback; unify the env contract before enabling
  Prisma/Turso in production.
- Auth is still file-based (`data/users.json`); no `SessionProvider` in the root layout.
- Device/API-key authentication for ESP32 telemetry is still missing.
- Rate limiting is per-process; use Redis/Upstash behind multiple instances.
- `prisma/dev.db` is still tracked; consider untracking it (`prisma/*.db` is ignored).
- Profile/Settings/Help pages are still unimplemented; the user menu intentionally
  exposes only Logout until those routes exist.
- No automated test suite; CI no longer pretends one exists. Add Vitest/Playwright.

## [2026-11-19] Full `src/` Restructure + Hardware UI Removal

Scope: `./` — moved the web app under `src/`, split by responsibility, and
removed the remaining hardware UI.

### Structure

| Before | After |
| --- | --- |
| `app/` | `src/app/` |
| `components/*.tsx` | `src/features/<domain>/*.tsx` (`farmer`, `gate`, `queue`, `demo`, `shell`) |
| `lib/types.ts`, `lib/spatial.ts`, `lib/audio.ts` | `src/shared/` |
| `lib/validation/telemetry.ts` | `src/shared/validation/telemetry.ts` |
| `lib/db.ts`, `lib/prisma.ts`, `lib/rate-limit.ts` | `src/server/` |
| `lib/roles.ts`, `lib/users.ts` | `src/server/auth/` |
| `proxy.ts` | `src/proxy.ts` |

`@/*` now resolves to `./src/*`; Tailwind content globs and the `@config` path in
`src/app/globals.css` were updated to match.

### Removed

| Item | Reason |
| --- | --- |
| `components/FirmwareView.tsx` + `/firmware` page | Hardware UI must not ship on the website (Phase H1). |
| `components/HardwareBench.tsx` + `/weigh` page | Virtual ESP32 bench removed; weighbridge data now arrives only via API. |
| `metadata.json` | Unused AI Studio/Gemini metadata; no references. |
| `tsconfig.tsbuildinfo` | Build artifact; gitignored. |
| `prisma/dev.db` | Local SQLite file; untracked (`prisma/*.db` is ignored). File kept on disk. |
| `prebuild` secret-grep script | Targeted the now-deleted `components/FirmwareView.tsx`. |

Navigation and proxy role maps no longer reference `/weigh` or `/firmware`.
The telemetry ingest endpoints are unchanged.

### Docs Restructure

```text
docs/
├── README.md              # map
├── DELETION_LOG.md
├── reference/             # api, architecture, components, data-models, flow-overview
├── design/                # design-system + full mandi flow design system
├── guides/                # development-guide-baby, SECRETS, TURSO_AUTH_SECURITY
├── plans/                 # PRODUCTION_REBUILD_PLAN (active only)
├── archive/               # MASTER_PLAN, phases 1–6, TODO, DECISION_LOG, old plans
├── audit/                 # project audit reports (historical)
└── ca2/                   # CA2 report artifacts (kept)
```

### Verification

- `npm run build` — pass; routes are `/`, `/demo`, `/login`, `/forgot-password`,
  `/unauthorized`, `/farmer`, `/gate`, `/queue` + the v1 APIs. No `/firmware` or `/weigh`.
- `npm run lint` — pass.
- `npm run type-check` — pass.

## 2026-11-19 — Pure Clay UI, role panels, diagnostics

### Added

| Item | Purpose |
| --- | --- |
| `src/features/system/Providers.tsx` | Client boundary wiring `SessionProvider`, `ThemeProvider`, and runtime log capture. |
| `src/features/system/ThemeProvider.tsx` | Persisted light/dark theme synced across tabs. |
| `src/features/system/ThemeToggle.tsx` | Clay theme switch for the shell and auth pages. |
| `src/features/system/RoleGuide.tsx` | Role-scoped walkthrough modal opened inside the authenticated shell. |
| `src/features/system/SettingsPanel.tsx` | Profile, access scope, appearance, and diagnostics sections. |
| `src/features/system/LogsPanel.tsx` | Verbose toggle, level filters, search, JSON export, and clear. |
| `src/features/system/ClaySwitch.tsx` | Accessible clay switch. |
| `src/shared/logger.ts` | 500-entry localStorage log ring buffer + global error/fetch capture. |
| `src/shared/roles.ts` | Client-safe role labels, summaries, and role-home routing. |
| `src/app/(dashboard)/settings/page.tsx` | Shared account, theme, and log viewer. |
| `src/app/(dashboard)/admin/page.tsx` | Admin-only network overview. |

### Removed

| Item | Reason |
| --- | --- |
| `src/app/demo/page.tsx` | Public all-panel demo; replaced by the role-scoped guide inside the shell. |
| `src/features/demo/InteractiveDemoModal.tsx` | Demo UI must not be reachable without a role. |
| `/demo` public allowlist entry in `src/proxy.ts` | The route no longer exists. |

### Changed

- `src/app/globals.css` now carries the Pure Clay token system, light/dark palettes, clay
  utilities, and a `.clay-app` compatibility layer for legacy panel classes.
- `src/app/layout.tsx` mounts `Providers` and applies the stored theme before first paint.
- `Navigation` and `Breadcrumb` filter by session role; admins see Overview/Gate/Queue/Settings,
  operators Gate/Queue/Settings, farmers My Deliveries/Settings.
- Login redirects admins to `/admin` (operators `/gate`, farmers `/farmer`).
- `src/proxy.ts` adds `/admin` as admin-only.
- `src/app/api/auth/[...nextauth]/route.ts` rate-limits only credential submissions; session,
  CSRF, and provider `GET`s are no longer throttled (this previously caused spurious 429s and a
  lost client session role).

### Verification

- `npm run lint` — pass.
- `npm run type-check` — pass.
- `npm run build` — pass; routes are `/`, `/login`, `/forgot-password`, `/unauthorized`,
  `/farmer`, `/gate`, `/queue`, `/settings`, `/admin` + the v1 APIs. `/demo` is gone.
