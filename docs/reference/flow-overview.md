# Mandi App Flow Overview

The **MandiSync** application guides users through the agricultural logistics journey, from slot booking to final receipt. This walkthrough is derived from the design system in `../design/mandi_app_flow_ui_design_system.md`.

## 1. Authentication & Roles
- Root route (`/`) is public.
- Unauthenticated users visiting a protected route are redirected to `/login`.
- Demo accounts are file-backed (`data/users.json`); password reset UI lives at `/forgot-password`.
- Three roles exist: **Farmer**, **Operator**, and **Admin**.
- Each role lands on its own home after sign-in: `/farmer`, `/gate`, or `/admin`. Navigation,
  breadcrumbs, pages, and API routes are filtered by role, so another role's panel is never
  exposed. `/settings` is shared by all authenticated roles.
- The shell exposes a role-scoped **Quick guide** instead of a public all-panel demo.

## 2. Farmer Flow
1. **Dashboard** – shows upcoming booked passes and a *Book New Arrival Slot* action.
2. **Select Mandi** – lists nearby mandis based on GPS (Haversine distance) with live quota bars.
3. **Book Slot** – farmer selects crop, estimated weight, and a 1-hour time window.
4. **Pass Issued** – server creates a signed QR pass for gate scanning.
5. **Live Queue** – shows queue position and ETA; gate scan (RFID or QR) validates the pass.
6. **Receipt** – after weighbridge telemetry, the farmer receives a digital certificate.

## 3. Mandi Official / Gate Flow
1. **Dashboard** – overview of arrival density and remaining capacity.
2. **Scan Pass** – camera/RFID scan validates the token via `/api/v1/telemetry/gate-verify` and triggers the gate barrier.
3. **Scale Monitor** – ESP32 HX711 telemetry posts gross/tare readings through `/api/v1/telemetry/weighbridge`.

## 4. Administrator Flow
1. **Overview** – network-wide booking, capacity, delivery, and telemetry summary at `/admin`.
2. **Mandi capacity** – per-mandi allocation, queue length, and wait time.
3. **Inherited desks** – administrators can open the Gate Desk and Queue Ledger for exceptions.
4. **Diagnostics** – enable verbose logging in `/settings` and export the runtime log.

## 5. Core API Interactions
- **Booking Creation** – `POST /api/v1/bookings/create`.
- **Queue Status** – `GET /api/v1/queue/status` returns bookings, logs, mandis, and aggregated metrics.
- **Gate Verification** – `POST /api/v1/telemetry/gate-verify` validates QR/RFID passes.
- **Weighbridge Telemetry** – `POST /api/v1/telemetry/weighbridge` records gross/tare measurements.
- **Offline Sync** – `POST /api/v1/telemetry/batch-sync` flushes buffered LittleFS packets.

## 6. UI Architecture (High-Level)
- **`src/app/page.tsx`** – public landing page; it never links to an authenticated panel directly.
- **`src/app/(dashboard)/`** – authenticated Admin, Farmer, Gate, Queue, and Settings views.
- **`src/features/`** – domain components (`FarmerPortal`, `GateControlDesk`, `QueueLedger`, shell,
  and system components such as `ThemeProvider`, `RoleGuide`, `SettingsPanel`, `LogsPanel`).
- **`src/proxy.ts`** – role-aware route protection and security headers.
- **Design System** – Pure Clay CSS tokens in `src/app/globals.css` with light and dark palettes,
  soft inset/raised shadows, and a `.clay-app` compatibility layer for the legacy panel utilities.
- **Diagnostics** – a localStorage ring buffer plus `/settings` viewer records verbose debug
  events, warnings, errors, rejected promises, and failed fetches.
