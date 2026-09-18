# Mandi App Flow Overview

The **MandiSync** application is a progressive web app (PWA) that guides users through the full agricultural logistics journey, from slot booking to final receipt generation. Below is a concise walkthrough of the primary user flows, derived from `mandi_app_flow_ui_design_system.md`.

## 1. Authentication & Role Selection
- Root route (`/`) performs an auth check.
- Unauthenticated users are redirected to `/auth/login` (Phone + OTP) or `/auth/register` (profile details, role selection).
- Two roles exist: **Farmer** and **Mandi Official/Gate**.

## 2. Farmer Flow
1. **Dashboard** – shows upcoming booked passes (cached in IndexedDB) and a *Book New Arrival Slot* button.
2. **Select Mandi** – lists nearby mandis based on GPS (Haversine query) with live quota bars.
3. **Book Slot** – farmer selects crop, estimated weight, and a 1‑hour time window.
4. **Pass Issued** – server creates a SHA‑256 HMAC‑signed QR pass; payload stored offline for gate scanning.
5. **Live Queue** – shows queue position and ETA; gate scan (RFID or QR) validates the pass and opens the barrier.
6. **Receipt** – after weighbridge telemetry, the farmer receives a digital certificate (PDF/image).

## 3. Mandi Official / Gate Flow
1. **Dashboard** – overview of arrival density and remaining capacity.
2. **Scan Pass** – camera scan validates the QR/HMAC token via `/api/v1/telemetry/gate-verify` and triggers the gate barrier.
3. **Scale Monitor** – live telemetry from ESP32 HX711 scale; monitors gross/tare readings and submits final ledger entries.

## 4. Core API Interactions
- **Booking Creation** – `POST /api/v1/bookings/create` (transactional batch DB write).
- **Queue Status** – `GET /api/v1/queue/status` returns bookings, logs, mandis, and aggregated metrics.
- **Gate Verification** – `POST /api/v1/telemetry/gate-verify` validates QR passes.
- **Weighbridge Telemetry** – `GET /api/v1/telemetry/weighbridge` streams live weight data.

## 5. UI Architecture (High‑Level)
- **`app/page.tsx`** – main entry point with a tabbed navigation bar (Farmer, Gate, Weigh, Queue, Firmware). State is managed via React hooks and refreshed every 5 seconds.
- **Components** – each tab is encapsulated in a dedicated component (`FarmerPortal`, `GateControlDesk`, `HardwareBench`, `FirmwareView`).
- **Design System** – Tailwind‑based token system (emerald, amber, slate) and typography hierarchy (display, headings, body, caption) for outdoor readability.

This overview captures the essential flow and architecture for developers and stakeholders.
