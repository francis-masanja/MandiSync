# MandiSync

Agricultural market synchronization system for farmers, mandis, and weighbridge operations.

## Features

- **Role-based workspaces** - one login, one panel: farmers see deliveries, operators see the gate and queue, administrators see the network overview
- **Farmer Portal** - book slots, view mandi availability, carry a QR pass, manage crop deliveries
- **Gate Control Desk** - RFID/QR verification, barrier control, weighbridge telemetry
- **Live Queue Ledger** - real-time booking queue and metrics
- **Admin overview** - network capacity, bookings, and recent telemetry across every mandi
- **Pure Clay UI** - claymorphism design system with persisted light and dark themes
- **Runtime diagnostics** - verbose logging ring buffer, filterable log viewer, JSON export, and a role-scoped quick guide
- **Telemetry Ingest API** - ESP32 gate and weighbridge devices post data (see `hardware/`)

## Run Locally

**Prerequisites:** Node.js 20+

```bash
npm install        # install dependencies
npm run dev        # run development server
npm run type-check # TypeScript
npm run lint       # ESLint
npm run build      # production build
```

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

Each role lands on its own home: `/farmer`, `/gate`, or `/admin`. Navigation, pages, and API
routes are filtered by role in `src/proxy.ts`. `/settings` holds the profile, the light/dark clay
theme, and the diagnostics log viewer (verbose mode captures debug events; warnings and errors are
always recorded).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
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
