# API Specification

The backend API resides under `app/api/v1/` and follows a REST‑like convention. All routes return JSON.

| Method | Path | Description |
|--------|------|-------------|
| **POST** | `/api/v1/reset` | Reset demo queue records and logs to initial seed data.
| **GET** | `/api/v1/queue/status` | Retrieve current queue status, including bookings, telemetry logs, mandis, and aggregated metrics.
| **GET** | `/api/v1/mandis` | List available mandis (farm markets) – used by the Farmer portal.
| **POST** | `/api/v1/bookings/create` | Create a new delivery booking from the Farmer portal.
| **GET** | `/api/v1/telemetry/weighbridge` | Fetch weighbridge telemetry data (gross, tare, net weights).
| **POST** | `/api/v1/telemetry/gate-verify` | Verify a vehicle against RFID gate.
| **GET** | `/api/v1/telemetry/batch-sync` | Batch sync telemetry logs from edge devices.

### Request / Response Shapes

All request bodies and responses adhere to the TypeScript interfaces in `lib/types.ts`:

```ts
export interface Mandi { id: string; name: string; /* … */ }
export interface Booking {
  id: string;
  farmer_name: string;
  farmer_village: string;
  mandi_name: string;
  slot_window: string;
  vehicle_number: string;
  rfid_tag: string;
  crop_type: string;
  estimated_kg: number;
  actual_gross_kg?: number;
  actual_tare_kg?: number;
  actual_net_kg?: number;
  total_payout_inr?: number;
  status: 'PENDING' | 'GATE_VERIFIED' | 'WEIGHED_GROSS' | 'COMPLETED';
}
export interface TelemetryLog { /* … */ }
```

Error responses follow the standard Next.js API error format:
```json
{ "error": "Message describing the problem" }
```
