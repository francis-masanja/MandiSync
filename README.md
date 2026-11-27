# MandiSync

Agricultural market synchronization system for farmers, mandis, and weighbridge operations.

## Features

- **Role-based workspaces** - one login, one panel: farmers see deliveries, operators see the gate and queue, administrators see the network overview
- **Farmer Portal** - self-service farmer signup, slot booking, mandi availability, QR pass, and crop deliveries
- **Gate Control Desk** - RFID/QR verification, barrier control, weighbridge telemetry
- **Live Queue Ledger** - real-time booking queue and metrics
- **Admin overview** - network capacity, bookings, and recent telemetry across every mandi
- **Pure Clay UI** - claymorphism design system with persisted light and dark themes
- **Runtime diagnostics** - verbose logging ring buffer, filterable log viewer, JSON export, and a role-scoped quick guide
- **Telemetry Ingest API** - ESP32 gate and weighbridge devices post data (see `hardware/`)

## Run Locally

**Prerequisites:** Node.js 20+

```bash
cp .env.example .env   # set NEXTAUTH_SECRET and NEXTAUTH_URL
npm install        # install dependencies (generates the Prisma client)
npm run dev        # run development server
npm run type-check # TypeScript
npm run lint       # ESLint
npm run build      # production build
```

Without `DATABASE_URL` the app uses the in-memory demo dataset and the demo
accounts in `data/users.json`. With a Turso/libSQL database:

```bash
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:migrate
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
```

`db:migrate` uses the libSQL client because the Prisma CLI does not accept
`libsql://` URLs. `GET /api/health` reports whether the app is in memory or
database mode.

## Project Structure

```text
src/
├── app/                # Next.js App Router pages & API routes
│   ├── api/v1/         # REST API endpoints
│   ├── (auth)/         # Login and password-reset pages
│   ├── (dashboard)/    # Admin, farmer, gate, queue, settings pages
│   └── page.tsx        # Public landing page
├── features/           # UI by domain (farmer, gate, queue, shell, system)
├── server/             # db, prisma, rate limiting, auth helpers
├── shared/             # types, spatial math, audio, logger, zod schemas
└── proxy.ts            # Next.js 16 proxy (role auth + security headers)

hardware/               # ESP32 firmware, protocol, and device tools
prisma/                 # Schema, migrations and local demo database
scripts/                # Seed and utility scripts
docs/                   # Reference, design, guides, plans, archive, CA2
```

Demo accounts live in `data/users.json` (seeded by `scripts/seed-users.js`):
`farmer@example.com`, `operator@example.com`, and `admin@example.com`.

New farmers can register at `/signup`; the account is written to `data/users.json` and
mirrored to the Prisma `User` table when `DATABASE_URL` is set. Gate operator and
administrator accounts are not self-service.

Each role lands on its own home: `/farmer`, `/gate`, or `/admin`. Navigation, pages, and API
routes are filtered by role in `src/proxy.ts`. `/settings` holds the profile, the light/dark clay
theme, and the diagnostics log viewer (verbose mode captures debug events; warnings and errors are
always recorded).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | Create a farmer account from the public signup page |
| `GET /api/v1/mandis` | List all mandis with distance |
| `GET /api/v1/queue/status` | Live queue & metrics |
| `POST /api/v1/bookings/create` | Create new booking |
| `POST /api/v1/telemetry/gate-verify` | RFID gate verification |
| `POST /api/v1/telemetry/weighbridge` | Weighbridge measurement |
| `POST /api/v1/telemetry/batch-sync` | LittleFS offline buffer sync |
| `POST /api/v1/reset` | Reset demo data |

Docs map: [`docs/README.md`](docs/README.md).

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4** + **tw-animate-css**
- **Lucide React** icons
- **NextAuth** + **bcryptjs**
- **QRCode** for gate tokens
- **Prisma** / libSQL data layer
