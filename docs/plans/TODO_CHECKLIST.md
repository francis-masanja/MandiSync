# MandiSync Implementation Todo Checklist

This master checklist aggregates all tasks from the phased plans. Tick each box as the work progresses. The list is ordered roughly by dependency (Phase 1 first, then Phase 2, etc.).

---

## ✅ Phase 1 – Test Infrastructure & Quality Gates
- [ ] Install Vitest + dependencies
- [ ] Write unit tests for all 7 API routes
- [ ] Write unit tests for core library functions (`spatial`, `crypto`, `db`)
- [ ] Install Playwright + dependencies
- [ ] Write E2E tests for tab navigation
- [ ] Write E2E test for full FarmerPortal flow (GPS → Mandi → Slot → Pass → Receipt)
- [ ] Write E2E test for GateControlDesk RFID flow
- [ ] Write E2E test for HardwareBench weighbridge flow
- [ ] Write E2E test for Demo modal sequence
- [ ] Add CI workflow steps (lint → type‑check → test → e2e → build)
- [ ] Set coverage thresholds (≥ 80 % for all categories)
- [ ] Fix all lint/type errors revealed by the CI run

---

## ✅ Phase 2 – Production Hardening (DB, Auth, Logging)
- [ ] Choose DB provider (Turso or SQLite) – pending decision
- [ ] Write migration scripts for the full schema (see `PHASE_2_PRODUCTION_HARDENING.md`)
- [ ] Replace `MandiSyncDatabase` with DB client implementation
- [ ] Implement request‑logging middleware (Pino JSON logs)
- [ ] Add global error handling (`app/global-error.tsx`)
- [ ] Implement Phone‑OTP authentication flow (login & register)
- [ ] Add role‑based routing middleware (farmer/official)
- [ ] Implement rate‑limiting middleware (Upstash or in‑memory)
- [ ] Add environment validation (`lib/env.ts` using Zod)
- [ ] Create `/api/health` endpoint

---

## ✅ Phase 3 – Farmer & Official Flow Completion
- [ ] Build `/auth/login` and `/auth/register` pages (OTP UI)
- [ ] Create `/farmer/dashboard` with IndexedDB‑cached passes
- [ ] Implement `/farmer/select-mandi` (geolocation + Haversine)
- [ ] Build `/farmer/book-slot` form (crop, weight, time‑slot grid)
- [ ] Generate HMAC token & QR code on `/farmer/pass‑issued`
- [ ] Implement `/farmer/live‑queue` polling UI
- [ ] Build `/farmer/receipt` with PDF download
- [ ] Create `/official/dashboard` (metrics cards)
- [ ] Implement `/official/scan‑pass` QR scanner + gate verification
- [ ] Build `/official/scale‑monitor` live weight UI & ledger submit
- [ ] Wire all routes into the auth/role middleware
- [ ] Add React Query hooks for data fetching and mutations
- [ ] Add offline IndexedDB sync logic for passes

---

## ✅ Phase 4 – Hardware Integration
- [ ] Add "Connect ESP32 Gate" button & serial handling in `GateControlDesk`
- [ ] Add "Connect ESP32 Scale" button & serial handling in `HardwareBench`
- [ ] Build `/admin/devices` UI for device registration and API‑key generation
- [ ] Write firmware flash guide (`docs/hardware/firmware-flash.md`)
- [ ] Create physical E2E hardware test checklist

---

## ✅ Phase 5 – Monitoring & Operations
- [ ] Add Vercel Analytics (or custom metrics) integration
- [ ] Implement Pino structured logging middleware
- [ ] Write `docs/ops/runbook.md` with alert thresholds and common issues
- [ ] Set up GitHub Actions uptime monitor (`.github/workflows/uptime.yml`)

---

## ✅ Phase 6 – Documentation & Release
- [ ] Configure `gh-pages` deployment for `docs/`
- [ ] Write `CONTRIBUTING.md` (architecture links, testing requirements)
- [ ] Record Playwright demo video of UI flow (upload to YouTube & embed)
- [ ] Add release workflow (`.github/workflows/release.yml`)
- [ ] Initialize `CHANGELOG.md` with proper sections

---

## 📦 Pending Decisions
- **Database provider** (Turso vs SQLite)
- **Phone OTP provider** (Twilio vs Firebase vs mock)
- **Any priority re‑ordering** (if resources are limited)

---

**How to use this checklist**
- Open the file in your IDE.
- Click the checkboxes as you finish each task.
- The checklist will auto‑update in the repo, providing a live view of progress.
