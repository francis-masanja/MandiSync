# MandiSync – Implementation Plan (Turso + Polling + Vercel)

## Overview
This document outlines a pragmatic, step‑by‑step plan to turn the current demo application into a **real, production‑ready system** while keeping the constraints you requested:
- **Database:** Turso (libSQL / SQLite) via Prisma
- **Real‑time:** Simple polling using SWR (no WebSockets)
- **Auth:** Device API keys now, farmer OTP can be added later
- **Deployment:** Vercel (server‑less functions, Turso integration works out‑of‑the‑box)

---

## 1️⃣ Database – Turso + Prisma
### 1.1 Add Prisma & Turso driver
```bash
npm i -D prisma @prisma/client
npm i @prisma/adapter-libsql @libsql/client
npx prisma init --datasource-provider sqlite
```
- **`prisma/schema.prisma`** (see below) defines the data model.
- **Environment variables** (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`) are set in Vercel secrets.

### 1.2 Prisma schema (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("TURSO_DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  driverAdapters   = true   // required for libSQL adapter
}

model Mandi {
  id               String   @id @default(cuid())
  name             String
  code             String   @unique
  state            String
  district         String
  latitude         Float
  longitude        Float
  maxDailyKg       Int      @default(10000)
  allocatedTodayKg Int      @default(0)
  activeQueueCount Int      @default(0)
  avgWaitMinutes   Int      @default(0)
  slots            Slot[]
  bookings         Booking[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Slot {
  id              String   @id @default(cuid())
  mandiId         String
  mandi           Mandi    @relation(fields: [mandiId], references: [id])
  windowStart     String   // e.g. "08:00 AM"
  windowEnd       String   // e.g. "09:00 AM"
  totalCapacityKg Int      @default(5000)
  bookedKg        Int      @default(0)
  isAvailable     Boolean  @default(true)
  bookings        Booking[]
}

enum BookingStatus {
  CONFIRMED
  GATE_VERIFIED
  WEIGHED_GROSS
  COMPLETED
  CANCELLED
}

model Booking {
  id             String         @id @default(cuid())
  farmerId       String
  farmerName     String
  farmerPhone    String
  farmerVillage  String
  mandiId        String
  mandi          Mandi          @relation(fields: [mandiId], references: [id])
  slotId         String
  slot           Slot           @relation(fields: [slotId], references: [id])
  cropType       String
  cropVariety    String?
  estimatedKg    Int
  actualGrossKg  Int?
  actualTareKg   Int?
  actualNetKg    Int?
  moisturePct    Float?
  ratePerQuintal Int
  totalPayoutInr Int?
  hmacToken      String         @unique
  status         BookingStatus  @default(CONFIRMED)
  vehicleNumber  String
  rfidTag        String         @unique
  distanceKm     Float
  createdAt      DateTime       @default(now())
  gateEntryAt    DateTime?
  grossWeighedAt DateTime?
  tareWeighedAt  DateTime?
  telemetryLogs  TelemetryLog[]
}

enum SensorType {
  RFID_UHF
  HX711_ADC
  ULTRASONIC
  SERVO_BARRIER
  LITTLEFS_BUFFER
}

enum LogStatus {
  SUCCESS
  WARNING
  ERROR
  OFFLINE_BUFFERED
}

model TelemetryLog {
  id         String     @id @default(cuid())
  timestamp  DateTime   @default(now())
  deviceId   String
  sensorType SensorType
  action     String
  rawPayload String
  status     LogStatus
  bookingId  String?
  booking    Booking?   @relation(fields: [bookingId], references: [id])
}

enum DeviceType {
  GATE_CONTROLLER
  WEIGHBRIDGE
  FARMER_PORTAL
}

model Device {
  id        String    @id @default(cuid())
  name      String
  apiKey    String    @unique   // HMAC secret used by ESP32 devices
  type      DeviceType
  mandiId   String?
  mandi     Mandi?    @relation(fields: [mandiId], references: [id])
  lastSeen  DateTime?
  createdAt DateTime  @default(now())
}
```
---

## 2️⃣ API Layer – Serverless Functions (Vercel)
All routes stay under `app/api/v1/...` and keep `export const dynamic = 'force-dynamic'`.

### 2.1 Middleware – Device API‑Key verification (`lib/auth.ts`)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function verifyDevice(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!auth) return null;
  return await db.device.findUnique({ where: { apiKey: auth } });
}
```
Each telemetry endpoint calls this helper; if it returns `null` the request is rejected with **401**.

### 2.2 Example Route Updates
- **GET /api/v1/mandis** – returns mandis with their slots.
- **POST /api/v1/bookings/create** – validates input (Zod), creates a booking, returns `hmac_token`.
- **POST /api/v1/telemetry/gate-verify** – verifies RFID, updates booking status, logs telemetry.
- **POST /api/v1/telemetry/weighbridge** – handles GROSS/TARE measurements, updates booking and logs.
- **POST /api/v1/telemetry/batch-sync** – bulk `createMany` for offline‑buffered logs.
- **GET /api/v1/queue/status** – active queue overview (used by UI polling).

All routes use **Zod** schemas for validation, e.g. `lib/validators/booking.ts`.
---

## 3️⃣ Front‑end – Data Integration with SWR Polling
### 3.1 SWR Hooks (`hooks/`)
```ts
// hooks/useMandis.ts
import useSWR from 'swr';
export const useMandis = () => useSWR('/api/v1/mandis', fetcher);

// hooks/useBookings.ts
export const useBookings = (mandiId?: string) =>
  useSWR(mandiId ? `/api/v1/queue/status?mandi=${mandiId}` : null, fetcher, {
    refreshInterval: 5_000, // 5 s polling
    fallbackData: [],
  });

// hooks/useTelemetry.ts
export const useTelemetry = (deviceId?: string) =>
  useSWR(deviceId ? `/api/v1/devices/${deviceId}/logs` : null, fetcher, {
    refreshInterval: 3_000,
    fallbackData: [],
  });
```
### 3.2 Server‑Component Pages (initial data)
```tsx
// app/(dashboard)/farmer/page.tsx
import { db } from '@/lib/db';

export default async function FarmerPage() {
  const mandis = await db.mandi.findMany({ include: { slots: true } });
  const bookings = await db.booking.findMany({
    where: { status: { in: ['CONFIRMED', 'GATE_VERIFIED'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return <FarmerPortalClient initialMandis={mandis} initialBookings={bookings} />;
}
```
`FarmerPortalClient` (client component) receives the **initial** data and then uses the SWR hooks for live updates and mutations.

### 3.3 Client‑Component Example (`components/FarmerPortalClient.tsx`)
```tsx
'use client';
import { useMandis } from '@/hooks/useMandis';
import { useBookings } from '@/hooks/useBookings';
import useSWRMutation from 'swr/mutation';

export function FarmerPortalClient({ initialMandis, initialBookings }) {
  const { data: mandis = initialMandis } = useMandis();
  const { data: bookings = initialBookings } = useBookings();

  const { trigger: createBooking } = useSWRMutation(
    '/api/v1/bookings/create',
    (url, { arg }) => fetch(url, { method: 'POST', body: JSON.stringify(arg) }).then(r => r.json())
  );

  const handleSubmit = async (form) => {
    const res = await createBooking(form);
    if (res?.success) {
      // SWR will automatically refetch bookings because the endpoint is polling
    }
  };

  return (
    <FarmerPortal
      mandis={mandis}
      activeBookings={bookings}
      onBookingCreated={handleSubmit}
    />
  );
}
```
Similar client wrappers exist for **GateControlDesk**, **HardwareBench**, and **QueueLedger**.
---

## 4️⃣ Device Provisioning (API Keys)
Run a one‑off script (or a manual admin UI) to create devices with unique API keys.
```ts
// scripts/provision-devices.ts
import { db } from '@/lib/db';
import crypto from 'crypto';

async function main() {
  const devices = [
    { name: 'Karnal Gate 1', type: 'GATE_CONTROLLER', mandiId: 'mandi-01' },
    { name: 'Karnal Scale 1', type: 'WEIGHBRIDGE', mandiId: 'mandi-01' },
    // add others …
  ];

  await Promise.all(
    devices.map(d =>
      db.device.create({
        data: {
          ...d,
          apiKey: `${d.type.toLowerCase()}_${crypto.randomBytes(20).toString('hex')}`,
        },
      })
    )
  );
  console.log('Devices provisioned');
}

main();
```
The generated `apiKey` is stored on the device (e.g., LittleFS) and sent as `Authorization: Bearer <key>` with every telemetry POST.
---

## 5️⃣ Vercel Deployment
### 5.1 `vercel.json`
```json
{
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 30 }
  },
  "env": {
    "TURSO_DATABASE_URL": "@turso-db-url",
    "TURSO_AUTH_TOKEN": "@turso-auth-token"
  }
}
```
- Add the two secret values in **Vercel → Settings → Environment Variables** (as **Encrypted Secrets**).
- Build command (package.json): `"build": "prisma generate && next build"`
- Deploy automatically on push to `main`.
---

## 6️⃣ Testing & Observability (Future Enhancements)
- **Unit tests** for Prisma service layer (`jest` + `@prisma/client` connection to an in‑memory SQLite DB).
- **Integration tests** for API routes using `supertest`.
- **E2E** (Cypress/Playwright) to cover the full farmer → gate → weigh → payout flow.
- **Logging**: Pino + Vercel logs, optional Sentry for error capture.
- **Metrics**: Simple endpoint `/api/v1/metrics` exposing queue length, avg wait time, etc., consumable by Vercel analytics.
---

## 7️⃣ Next Steps (Action Items)
1. **Create `prisma/schema.prisma`** (copy from section 1.2).
2. **Add Turso credentials** to Vercel and a local `.env`.
3. **Run migrations & seed** (`npx prisma migrate dev --name init`).
4. **Implement API key middleware** (`lib/auth.ts`).
5. **Replace in‑memory `db.ts`** with Prisma client wrapper.
6. **Add Zod validators** for each route.
7. **Refactor page components** to use SWR hooks (as shown).
8. **Write a provisioning script** for device API keys.
9. **Add `vercel.json`** and adjust `package.json` build script.
10. **Deploy** to Vercel and verify the poll‑based UI updates.
---

### Want to start?
If you approve this plan, I’ll begin with **Phase 1** (Turso + Prisma schema + seed) and commit the first set of changes.

---

*Document generated by OpenCode on $(date)*
