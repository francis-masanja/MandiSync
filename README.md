# MandiSync

Agricultural market synchronization system for farmers, mandis, and weighbridge operations.

## Features

- **Farmer Portal** - Book slots, view mandi availability, manage crop deliveries
- **Gate Control Desk** - RFID/QR verification, barrier control
- **Hardware Bench** - Live weighbridge data (HX711 ADC)
- **Live Queue Ledger** - Real-time booking queue and metrics
- **Firmware View** - ESP32 C++ source inspection

## Run Locally

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run type-check
npm run type-check

# Run lint
npm run lint

# Build for production
npm run build
```

## Project Structure

```
app/                    # Next.js App Router pages & API routes
├── api/v1/             # REST API endpoints
└── page.tsx            # Main dashboard with 5 tabs

components/             # React components (5 tab components)
lib/                    # Core logic (db, types, crypto, spatial, etc.)
docs/                   # Architecture, API, components, data models
```

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

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4** + **tw-animate-css**
- **Lucide React** icons
- **Motion** for animations
- **QRCode** for gate tokens