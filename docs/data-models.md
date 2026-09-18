# Data Model Definitions

The core domain entities are defined in `lib/types.ts`:

```ts
export interface Mandi {
  id: string;
  name: string;
  location: string;
  // Additional fields as needed
}

export interface Booking {
  id: string;
  farmer_name: string;
  farmer_village: string;
  mandi_name: string;
  slot_window: string; // e.g. "08:00‑10:00"
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

export interface TelemetryLog {
  timestamp: string; // ISO date string
  device_id: string;
  type: 'WEIGH' | 'GATE' | 'OTHER';
  payload: any; // Raw telemetry payload, shape varies per device
}
```

These interfaces are shared between the frontend and backend to ensure type‑safe communication.
