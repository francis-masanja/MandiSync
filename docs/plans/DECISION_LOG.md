# Decision Log

## Overview
This file records key architectural decisions made during the planning and implementation phases of MandiSync. Each entry includes the date, the decision made, context, alternatives considered, and the final outcome.

---

## 2026‑09‑18 – Database Provider
- **Decision**: Choose between Turso (cloud) and SQLite (local) for persistent storage.
- **Context**: Phase 2 requires a persistent DB to replace the in‑memory `MandiSyncDatabase`.
- **Alternatives**:
  1. **Turso / libSQL** – fully managed, serverless, automatic backups, easy scaling.
  2. **SQLite + better‑sqlite3** – file‑based, no external service, easier local development.
- **Outcome**: **Pending** – awaiting stakeholder input on deployment preferences and budget.

---

## 2026‑09‑18 – Authentication Provider
- **Decision**: Phone‑OTP authentication flow for both farmers and officials.
- **Context**: Phase 2 needs secure auth before exposing protected routes.
- **Alternatives**:
  1. **Twilio Verify** – reliable SMS, paid per‑message.
  2. **Firebase Phone Auth** – free tier generous, integrates with Firebase Auth.
  3. **Mock OTP (development only)** – no external service, insecure for prod.
- **Outcome**: **Pending** – need clarification on preferred provider and cost constraints.

---

## 2026‑09‑18 – Deployment Platform
- **Decision**: Deploy to Vercel.
- **Context**: The app is a Next.js 16 project with static export and serverless functions.
- **Alternatives**:
  1. **Vercel** – native Next.js support, easy preview builds.
  2. **Netlify** – similar feature set, but less tight Next.js integration.
  3. **Self‑hosted (Docker on a VM)** – full control, higher ops overhead.
- **Outcome**: **Selected Vercel** (recommended for simplicity and CI integration).

---

## 2026‑09‑18 – Test Frameworks
- **Decision**: Use Vitest for unit tests and Playwright for E2E.
- **Context**: Phase 1 needs a fast, modern test runner with TypeScript support.
- **Alternatives**:
  1. **Vitest** – ESM, Jest‑compatible API, built‑in coverage.
  2. **Jest** – widely used but slower, extra configuration for Next.js.
  3. **Cypress** – excellent for E2E but heavier than Playwright for CI.
- **Outcome**: **Chosen Vitest + Playwright** (already integrated in the repo).

---

## 2026‑09‑18 – State Management
- **Decision**: TanStack Query (React Query) for server state, IndexedDB for offline passes.
- **Context**: The farmer flow must survive intermittent connectivity.
- **Alternatives**:
  1. **TanStack Query** – declarative, automatic caching, easy refetch.
  2. **SWR** – similar but less feature‑rich for mutations.
  3. **Redux Toolkit** – more boilerplate, not needed for simple fetching.
- **Outcome**: **TanStack Query** selected for data fetching; `idb` library for offline storage.

---

## 2026‑09‑18 – Device Provisioning UI
- **Decision**: Provide an `/admin/devices` page for officials to register ESP32 devices.
- **Context**: Phase 4 requires unique API keys per device to secure telemetry.
- **Alternatives**:
  1. **Manual key generation** (CLI only) – less user‑friendly.
  2. **Web UI** – can be audited, ties into existing auth flow.
- **Outcome**: **Web UI** implemented – one‑time key displayed only once.

---

## 2026‑09‑18 – Logging Library
- **Decision**: Use Pino for structured JSON logging.
- **Context**: Phase 5 requires high‑quality logs for observability.
- **Alternatives**:
  1. **Pino** – fast, low overhead, supports pretty‑printing.
  2. **Winston** – more plugin ecosystem, slower.
  3. **Console.log** – insufficient for production.
- **Outcome**: **Pino** selected.

---

## 2026‑09‑18 – Documentation Publishing
- **Decision**: Publish `docs/` via GitHub Pages using static export.
- **Context**: Phase 6 aims to make docs easily discoverable.
- **Alternatives**:
  1. **GitHub Pages** – free, simple static hosting.
  2. **Vercel Docs** – would require a separate project.
  3. **ReadTheDocs** – popular for Python, but extra configuration.
- **Outcome**: **GitHub Pages** chosen.

---

## 2026‑09‑18 – Release Process
- **Decision**: Tag‑based release workflow that triggers a Vercel production deploy.
- **Context**: Need a repeatable, CI‑driven release pipeline.
- **Alternatives**:
  1. **GitHub Actions** (tag → Vercel) – zero‑manual steps.
  2. **Manual Vercel Deploy** – error‑prone.
  3. **GitHub Releases + Deploy Scripts** – extra glue code.
- **Outcome**: **Tag‑based GitHub Actions** selected.

---

## Next Steps (Pending Decisions)
- Confirm **Database provider** (Turso vs SQLite).
- Confirm **Auth provider** (Twilio vs Firebase vs Mock).
- Align on any additional **priority ordering** for phases if resources are limited.
