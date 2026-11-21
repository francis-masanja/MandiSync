# Phase 2 – Production Hardening (DB, Auth, Logging)

## Objectives
- Replace the in‑memory DB with a persistent store.
- Add authentication & role‑based routing.
- Add observability (logging, health checks, error handling).
- Secure all API routes.

## Tasks

| # | Task | Details | Effort |
|---|------|---------|--------|
| 2.1 | **Database: Choose provider** | Decision: Turso/libSQL (cloud) vs SQLite + better‑sqlite3 (local). *See Decision Log* | 0.5 day |
| 2.2 | **Create DB schema & migrations** | Tables: mandis, slots, bookings, telemetry_logs, users, devices, offline_buffers | 1 day |
| 2.3 | **Migrate `MandiSyncDatabase`** | Replace in‑memory class with DB client, keep same public API | 1 day |
| 2.4 | **Request logging middleware** | Structured JSON logs with correlation IDs, request/response timing, user context | 0.5 day |
| 2.5 | **Global error handling** | `app/global-error.tsx`, `app/error.tsx`, API error wrapper with consistent JSON format | 0.5 day |
| 2.6 | **Auth: Phone OTP flow** | `/auth/login` (phone → OTP), `/auth/register` (profile + role), session cookie/JWT | 2 days |
| 2.7 | **Role‑based routing** | Middleware: Farmer → `/farmer/*`, Official → `/official/*`, redirect unauthenticated | 0.5 day |
| 2.8 | **Rate limiting** | `npm i @upstash/ratelimit @upstash/redis` or in‑memory sliding‑window implementation | 0.5 day |
| 2.9 | **Env validation** | `lib/env.ts` with Zod schema, fail fast at startup | 0.5 day |
| 2.10 | **Health check endpoint** | `GET /api/health` → `{ status, version, uptime, db_connected, memory_usage }` | 0.5 day |

## Database Schema (SQLite/Turso)
```sql
-- Core tables
CREATE TABLE mandis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  state TEXT, district TEXT,
  latitude REAL, longitude REAL,
  max_daily_kg INTEGER,
  allocated_today_kg INTEGER DEFAULT 0,
  active_queue_count INTEGER DEFAULT 0,
  avg_wait_minutes INTEGER DEFAULT 30
);

CREATE TABLE slots (
  id TEXT PRIMARY KEY,
  mandi_id TEXT REFERENCES mandis(id),
  window_start TEXT,
  window_end TEXT,
  total_capacity_kg INTEGER,
  booked_kg INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 1
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  farmer_id TEXT, farmer_name TEXT, farmer_phone TEXT, farmer_village TEXT,
  mandi_id TEXT REFERENCES mandis(id), mandi_name TEXT,
  slot_id TEXT REFERENCES slots(id), slot_window TEXT,
  crop_type TEXT, crop_variety TEXT, estimated_kg INTEGER,
  actual_gross_kg INTEGER, actual_tare_kg INTEGER, actual_net_kg INTEGER,
  moisture_pct REAL, rate_per_quintal INTEGER, total_payout_inr INTEGER,
  hmac_token TEXT, status TEXT DEFAULT 'CONFIRMED',
  vehicle_number TEXT, rfid_tag TEXT, distance_km REAL,
  created_at TEXT, gate_entry_at TEXT, gross_weighed_at TEXT, tare_weighed_at TEXT
);

CREATE TABLE telemetry_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT, device_id TEXT,
  sensor_type TEXT, action TEXT, raw_payload TEXT, status TEXT
);

-- Auth & devices
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  role TEXT CHECK(role IN ('farmer','official')),
  name TEXT, village TEXT,
  created_at TEXT
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT CHECK(type IN ('gate','scale')),
  api_key_hash TEXT,
  last_seen_at TEXT,
  status TEXT DEFAULT 'offline'
);

CREATE TABLE offline_buffers (
  id TEXT PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  payload_type TEXT,
  payload_json TEXT,
  created_at TEXT,
  synced_at TEXT
);
```

## Auth Flow (Phone OTP)
```
1. User visits `/` → middleware checks session.
2. No session → redirect `/auth/login`.
3. `/auth/login`: Enter phone → POST `/api/auth/send-otp`.
4. OTP sent (Twilio/mock) → user enters OTP → POST `/api/auth/verify-otp`.
5. Success → set session cookie → redirect based on role:
   - Farmer → `/farmer/dashboard`
   - Official → `/official/dashboard`
6. `/auth/register`: New users fill profile + select role, same OTP flow.
```

## Rate Limiting Example (Node)
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL! });
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 req/hr per IP
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });
  return NextResponse.next();
}
```

## Health Endpoint (`app/api/v1/health/route.ts`)
```ts
import { NextResponse } from "next/server";
export async function GET() {
  const dbConnected = true; // replace with real check
  return NextResponse.json({
    status: "ok",
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    db_connected: dbConnected,
    memory_usage: process.memoryUsage()
  });
}
```

---

## Decision Log (refer to `DECISION_LOG.md` for full context)
- **Database**: pending your choice between Turso (cloud) or local SQLite.
- **Auth**: pending provider (Twilio, Firebase, or mock).
- **Deployment**: Vercel (recommended).
