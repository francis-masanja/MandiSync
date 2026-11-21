# MandiSync Master Implementation Plan

> **Project**: Agricultural market synchronization system for farmers, mandis, and weighbridge operations
> **Stack**: Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4
> **Generated**: 2026-09-18

---

## 📊 Current State Summary

| Component | Status | Lines | Notes |
|-----------|--------|-------|-------|
| Core UI (5 tabs) | ✅ Complete | ~2,300 | FarmerPortal, GateControlDesk, HardwareBench, FirmwareView, InteractiveDemoModal |
| API Routes (7 endpoints) | ✅ Complete | ~200 | REST endpoints under `/api/v1/` |
| Database Layer | ✅ Complete | 444 | In-memory `MandiSyncDatabase` class with seed data |
| Hardware Simulation | ✅ Complete | ~550 | Audio synthesis, Web Serial, ESP32 firmware reference |
| Documentation | ✅ Complete | ~500 | Architecture, API, components, data models, design system, flow |
| **Tests** | ❌ Missing | 0 | No unit, integration, or E2E tests |
| **CI/CD** | 🟡 Partial | - | `.github/workflows/ci.yml` exists but incomplete |
| **Auth/Flows** | 🟡 Demo only | - | Full farmer/official flows per `mandi_app_flow_ui_design_system.md` not implemented |

---

## 🎯 Phase Overview

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **1** | Test Infrastructure & Quality Gates | 5.5 days | 🔴 HIGH |
| **2** | Production Hardening (DB, Auth, Logging) | 6.5 days | 🔴 HIGH |
| **3** | Farmer & Official Flow Completion | 8.5 days | 🟡 MEDIUM |
| **4** | Real Hardware Integration | 3.5 days | 🟡 MEDIUM |
| **5** | Monitoring & Operations | 2 days | 🟢 LOW |
| **6** | Documentation & Release Pipeline | 2.5 days | 🟢 LOW |

**Total Estimate**: ~28.5 days

---

## 🔗 Phase Dependencies

```
Phase 1 (Tests) ──────┬──→ Phase 2 (Hardening) ──────→ Phase 3 (Flows) ──────→ Phase 4 (Hardware)
                      │                              │
                      └──────────────────────────────┘ (can parallelize)
                                                         │
                      Phase 5 (Monitoring) ←───────────┘
                      Phase 6 (Docs/Release) ←─────────┘
```

- **Phase 1 must complete first** — enables safe refactoring for all later phases
- **Phase 2 & 3 can run in parallel** after Phase 1 (different code areas)
- **Phase 4 requires Phase 2** (auth/device provisioning)
- **Phase 5 & 6** are independent, run anytime after Phase 2

---

## ✅ Definition of Done (Per Phase)

### Phase 1: Test Infrastructure
- [ ] `npm test` runs Vitest unit tests with ≥80% coverage
- [ ] `npm run test:e2e` runs Playwright tests for all 5 tabs + demo modal
- [ ] CI workflow runs: `lint` → `type-check` → `test` → `build` on every PR
- [ ] Coverage report uploaded to CI artifacts
- [ ] All existing lint/type errors fixed

### Phase 2: Production Hardening
- [ ] SQLite/Turso database with migrations replacing in-memory DB
- [ ] Request logging middleware (structured JSON, correlation IDs)
- [ ] Global error boundary + error pages
- [ ] Phone OTP authentication (mock or real provider)
- [ ] Role-based routing (Farmer / Mandi Official)
- [ ] Rate limiting on all API routes
- [ ] Environment validation at startup
- [ ] `/api/health` endpoint returning DB status, version, uptime

### Phase 3: Farmer & Official Flows
- [ ] `/auth/login` + `/auth/register` (Phone OTP, role selection)
- [ ] `/farmer/dashboard` (IndexedDB cached passes, book new slot button)
- [ ] `/farmer/select-mandi` (GPS + Haversine, quota bars)
- [ ] `/farmer/book-slot` (crop, weight, 1-hr window selection)
- [ ] `/farmer/pass-issued` (HMAC QR, IndexedDB offline cache)
- [ ] `/farmer/live-queue` (position, ETA <45min, gate redirect)
- [ ] `/farmer/receipt` (Gross/Tare/Net, PDF download)
- [ ] `/official/dashboard` (arrival density, capacity)
- [ ] `/official/scan-pass` (camera QR scan → gate-verify → barrier)
- [ ] `/official/scale-monitor` (live HX711 telemetry, ledger submit)

### Phase 4: Hardware Integration
- [ ] Web Serial UI in GateControlDesk (connect/disconnect, live logs)
- [ ] Web Serial UI in HardwareBench (connect/disconnect, live scale)
- [ ] Device provisioning flow (register ESP32, assign device_id)
- [ ] Firmware flash guide (PlatformIO + Arduino IDE)
- [ ] E2E test: RFID scan → gate verify → weighbridge gross/tare → batch sync

### Phase 5: Monitoring & Operations
- [ ] Vercel Analytics or custom metrics dashboard
- [ ] Ops runbook (alert thresholds, common issues, runbooks)
- [ ] Structured logging with correlation IDs
- [ ] Uptime monitoring (cron job or external service)

### Phase 6: Documentation & Release
- [ ] `docs/` published to GitHub Pages
- [ ] `CONTRIBUTING.md` with architecture links
- [ ] Playwright UI demo video recorded + linked in README
- [ ] Release workflow: tag → build → deploy to Vercel
- [ ] `CHANGELOG.md` with semantic versioning

---

## 📁 Plan Files in This Directory

| File | Purpose |
|------|---------|
| `MASTER_PLAN.md` | This file — high-level overview |
| `PHASE_1_TEST_INFRASTRUCTURE.md` | Detailed Phase 1 tasks, test specs, CI config |
| `PHASE_2_PRODUCTION_HARDENING.md` | DB migration, auth, logging, error handling |
| `PHASE_3_FARMER_OFFICIAL_FLOWS.md` | Route specs, component specs, state management |
| `PHASE_4_HARDWARE_INTEGRATION.md` | Web Serial, device provisioning, firmware guide |
| `PHASE_5_MONITORING_OPS.md` | Metrics, logging, runbooks, uptime |
| `PHASE_6_DOCS_RELEASE.md` | GitHub Pages, contributing, demo video, release workflow |
| `DECISION_LOG.md` | Records of key architectural decisions |
| `TODO_CHECKLIST.md` | Master checkbox list for tracking progress |