# MandiSync Production Rebuild Plan

> **Date:** 2026-10-29  
> **Status:** In progress — H1 (strip web hardware) and `src/` restructure complete 2026-11-19  
> **Baseline audit:** `docs/audit/PROJECT_AUDIT_REPORT.html` + `.json`  
> **Stack correction:** Next.js 16 (App Router), not Nuxt.

This single plan captures every agreed decision from the audit + structure review. Implementation is phased so the app stays runnable after each step.

---

## 0. Goals

1. **Hardware off the website** — no firmware viewer, Web Serial, or virtual bench in the web app. Devices talk only to API ingest endpoints.
2. **`hardware/` tree** — all ESP32 code + device docs live outside `src/`.
3. **Distribution server** — one brain that ingests device data, places bookings in the queue, and fans the same truth to gate keeper, farmer, and manager.
4. **Real auth** — login, signup, password reset, admin user management against the database (no `users.json`).
5. **Baby-mode docs in 5 modules** — anyone can understand the project in minutes.
6. **Toward production** — durable DB, tests, CI, no debug routes, device HMAC auth.

---

## 1. Target file structure (summary)

```text
mandisync/
├── src/                     # Next.js only (no firmware)
│   ├── middleware.ts
│   ├── app/                 # routes + thin API
│   ├── features/            # UI by domain
│   ├── server/              # db, auth, booking, distribution, telemetry
│   ├── shared/              # types, zod schemas, constants
│   └── config/env.ts
├── hardware/                # ALL device code + PROTOCOL + flash docs
├── prisma/
├── tests/
├── scripts/
├── docs/                    # 5 baby-mode modules + audit appendix
└── .github/workflows/
```

**Import rules:** `app → features → server/shared`. Server code is `server-only`. Features never import Prisma or secrets.

Full tree: see conversation plan / `docs/05-keep-alive/roadmap.md`.

---

## 2. Phase H1 — Strip hardware from website

> ✅ **Done 2026-11-19.** The items below were removed from the web app, which now
> lives under `src/`. Firmware and device code remain in `hardware/`.

### Delete from web (must not appear in build)

| Item | Path |
|---|---|
| Firmware viewer page | `app/(dashboard)/firmware/` |
| FirmwareView component | `components/FirmwareView.tsx` |
| Firmware source strings | `lib/firmware.ts` |
| Web Serial helper | `lib/web-serial.ts` |
| Hardware bench (virtual ESP32) | `components/HardwareBench.tsx` |
| Weigh page as serial bench | `app/(dashboard)/weigh/` → becomes data-only later; for H1 remove bench UI |

### Keep (connections only)

- `POST /api/v1/telemetry/gate-verify`
- `POST /api/v1/telemetry/weighbridge`
- `POST /api/v1/telemetry/batch-sync`
- Gate page may keep manual RFID entry (human path) until operator UI is rebuilt

### Nav / landing

- Remove “Firmware View” and “Weighbridge & LittleFS” as product tabs
- Landing: Farmer, Gate, Queue, Demo only

### Exit criteria

- `grep -ri "web-serial\|HardwareBench\|FirmwareView" src` → no product UI references
- Build green

---

## 3. Phase H2 — Hardware tree + protocol + device auth

### `hardware/` layout

```text
hardware/
├── README.md
├── DEPLOYMENT.md
├── PROTOCOL.md
├── shared/
│   ├── config.example.h
│   ├── hmac_util.h
│   └── littlefs_buffer.h
├── gate-node/
│   ├── gate_node.ino
│   └── wiring-gate.md
├── scale-node/
│   ├── scale_node.ino
│   └── wiring-scale.md
├── tools/
│   ├── make_device_key.sh
│   └── simulate_device.py
└── test-checklist.md
```

### Website API (hardened)

- Add device HMAC verification (`X-Device-Id`, `X-Device-Timestamp`, `X-Device-Signature`)
- Exempt device telemetry from HTML login redirect in middleware
- Add `POST /api/v1/devices/heartbeat`

### Exit criteria

- `python hardware/tools/simulate_device.py gate-verify` works against local dev
- Real cookie session not required for devices

---

## 4. Phase D — Docs into 5 baby-mode modules

```text
docs/
├── README.md                 # map only
├── 01-start-here/
├── 02-website/
├── 03-server/
├── 04-hardware/
├── 05-keep-alive/
└── audit/                    # appendix (existing reports)
```

Old flat docs retired per migration map (see Module plans). Every page:

- What this is / Why you care / Who should read
- Honest ✅ 🚧 ❌ status
- Baby recap at the end

---

## 5. Phase A — Auth, signup, user management

1. Users in Prisma (seed demo users); delete runtime use of `data/users.json`
2. `SessionProvider` in root layout
3. Public `/signup` (farmer self-register)
4. Password reset tokens (DB table; email can be console in dev)
5. `(admin)/users` list/create/deactivate/role change + audit log
6. Login redirects: farmer → `/farmer`, operator → `/official/gate`, admin → `/admin` (or existing pages until those routes exist)

---

## 6. Phase S — Distribution server

1. Domain services: `create-booking`, `verify-gate`, `apply-weighment`
2. Placement: FIFO position + lane assignment; capacity ledger
3. State machine: `CONFIRMED → GATE_VERIFIED → WEIGHED_GROSS → COMPLETED` (+ cancel/no-show)
4. `GET /api/v1/queue/stream` (SSE) + polling fallback
5. Role-scoped views: farmer own data only; operator floor; admin all + overrides

---

## 7. Phase P — Production hardening (from audit)

| ID | Action |
|---|---|
| CI-01 | Add Vitest; fix `npm test`; CI must pass |
| SEC-01 | Delete debug/test API routes |
| DATA-01 | Unify `DATABASE_URL` / Turso env; no silent in-memory in prod |
| DB-02 | Await Prisma calls; real reset or remove |
| DEP-01 | Add `zod` as direct dependency |
| SEC-02 | Auth inside `/api/v1/reset` |
| SEC-03 | Tighten CSP later |
| ROUTE-01 | Public landing + working `/demo` |

---

## 8. Recommended execution order

| Order | Phase | Notes |
|---|---|---|
| 1 | **Plans + docs skeleton** | This file + 5 modules |
| 2 | **H1** strip web hardware | Unblocks honest demo |
| 3 | **Critical fixes** debug routes, public landing, `/demo` | Same day as H1 |
| 4 | **H2** hardware/ + protocol + simulate tool | Devices decoupled |
| 5 | **A1** users in DB + SessionProvider | Real login |
| 6 | **D** finish baby docs content | After code stabilizes |
| 7 | **S** distribution + SSE | Needs stable booking APIs |
| 8 | **P** tests + CI + env | Before any pilot |

---

## 9. Out of scope (for now)

- Separate MQTT microservice (Next.js ingest is enough until scale demands it)
- Phone OTP (schema-ready later)
- Monorepo / mobile app
- Real email provider (console reset links in dev)

---

## 10. Decision log (this rebuild)

| Decision | Choice |
|---|---|
| Framework | Next.js 16 (as-is) |
| Hardware on website | Completely removed; connections only |
| Device code location | `hardware/` |
| Ingest | Next.js API + HMAC (not separate service yet) |
| Realtime | SSE + polling fallback (planned) |
| Signup | Email+password first; OTP later |
| Docs | 5 modules, baby mode |
| Audit reports | Stay as `docs/audit/` appendix |
