# Phase 3 – Farmer & Official Flow Completion

## Objectives
Implement the complete authenticated user journeys according to `mandi_app_flow_ui_design_system.md`.

## Route Map
```
/auth/login              → Phone OTP login
/auth/register           → Profile + role selection
/farmer/dashboard        → Cached passes + "Book New Slot"
/farmer/select-mandi     → GPS + Haversine mandi list with quotas
/farmer/book-slot        → Crop, weight, 1‑hr window selection
/farmer/pass-issued      → HMAC QR + IndexedDB offline cache
/farmer/live-queue       → Position, ETA, gate redirect
/farmer/receipt          → Gross/Tare/Net + PDF download
/official/dashboard      → Arrival density, capacity
/official/scan-pass      → Camera QR scan → gate‑verify → barrier
/official/scale-monitor  → Live HX711 telemetry, ledger submit
```

## Component Specs

### Farmer Dashboard (`/farmer/dashboard`)
- **Data source**: `GET /api/v1/bookings?farmerId=...`
- **Cache**: IndexedDB (`idb` wrapper) stores `passes` for offline use.
- **UI**:
  - Card list of upcoming passes (date, mandi, slot window, QR preview).
  - "Book New Arrival Slot" button → `/farmer/select-mandi`.
  - Offline indicator (sync status badge).
- **State**: React Query (`useQuery`) for server data, `useMutation` for new bookings.

### Select Mandi (`/farmer/select-mandi`)
- **Geolocation**: `navigator.geolocation.getCurrentPosition()`.
- **Distance calculation**: `calculateHaversineDistance` from `lib/spatial.ts`.
- **Mandi card UI**:
  - Name, distance (km), quota bar (`allocated_today_kg / max_daily_kg`).
  - Queue count, average wait (minutes).
  - Tap → `/farmer/book-slot?mandi_id=XYZ`.

### Book Slot (`/farmer/book-slot`)
- **Form fields**:
  - Crop selector (from `CROP_OPTIONS`).
  - Weight slider (500‑10 000 kg).
  - Time‑slot grid (1‑hr windows, show remaining capacity).
  - Vehicle plate & optional RFID tag (auto‑generate option).
- **POST** `/api/v1/bookings/create` with payload.
- **Success** → redirect to `/farmer/pass-issued?bookingId=...`.

### Pass Issued (`/farmer/pass-issued`)
- **HMAC token**: `generateHmacGateToken({farmerId, mandiId, slotId, cropType, rfidTag, createdAt})`.
- **QR payload**:
  ```json
  {"booking_id":"...","hmac":"...","rfid":"...","slot":"...","mandi":"..."}
  ```
- **IndexedDB storage** for offline pass:
  ```ts
  await idb.add('passes', {bookingId, qrData, hmac, expiresAt});
  ```
- **UI**: QR code preview, "View Live Queue" button.

### Live Queue (`/farmer/live-queue`)
- **Polling**: `GET /api/v1/queue/status?mandi_id=XYZ` every 10 s.
- **Display**: position, estimated wait (< 45 min target).
- **Gate redirect**: when status → `GATE_VERIFIED` → navigate to `/farmer/telemetry-status` (future step).

### Receipt (`/farmer/receipt`)
- **Fetch booking** (includes `actual_gross_kg`, `actual_tare_kg`, `actual_net_kg`).
- **Display**: Gross, Tare, Net, MSP rate, total payout.
- **PDF download**: `jsPDF` or server‑side PDF endpoint.

### Official Dashboard (`/official/dashboard`)
- **Metrics cards**:
  - Arrivals today, in‑queue, at weighbridge, completed.
  - Quota utilization bar (allocated / max).
  - Quick actions: "Scan Pass", "Scale Monitor".

### Scan Pass (`/official/scan-pass`)
- **QR library**: `@capacitor/camera` or `html5-qrcode`.
- **On scan**:
  1. Parse payload, extract HMAC.
  2. POST `/api/v1/telemetry/gate-verify` with HMAC.
  3. On success: show barrier animation, farmer details.
  4. Fallback: manual RFID entry.

### Scale Monitor (`/official/scale-monitor`)
- **Live data source**: WebSocket/SSE or polling of `/api/v1/telemetry/weighbridge?device_id=...`.
- **UI**: current weight, stability indicator, "Gross" / "Tare" buttons.
- **Submit**: `POST /api/v1/telemetry/weighbridge` → writes to DB, updates booking.

## State Management
- **Auth**: React Context + httpOnly session cookie.
- **Farmer flow**: URL params + React Query for server state.
- **Offline**: IndexedDB (`idb`) for passes, sync on reconnect.
- **Real‑time**: TanStack Query with `refetchInterval` for queue / telemetry.

## Acceptance Criteria
- All routes protected by authentication middleware.
- Farmer can complete the full 5‑step flow without errors.
- Official can scan a pass, verify gate, and record weighbridge data.
- Offline pass cached in IndexedDB survives a page reload and syncs when back online.
- UI matches the design system (Tailwind, component library).
