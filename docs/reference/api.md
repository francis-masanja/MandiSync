# API Specification

The backend API lives under `src/app/api/v1/` and returns JSON. All `/api/v1/*`
routes require an authenticated NextAuth session unless explicitly noted.
Requests without a session receive `401 {"error":"Unauthenticated"}`; requests
with an insufficient role receive `403 {"error":"Forbidden"}`.

| Method | Path | Description |
| --- | --- | --- |
| **POST** | `/api/v1/reset` | Reset demo data. Requires the `admin` role. |
| **GET** | `/api/v1/queue/status` | Bookings, telemetry logs, mandis, and aggregate metrics. Optional `mandiId` filter. |
| **GET** | `/api/v1/mandis` | List mandis with optional distance. Query: `farmer_lat`, `farmer_lon`, `limit`, `offset`. |
| **POST** | `/api/v1/bookings/create` | Create a booking. Requires the `farmer` role. |
| **POST** | `/api/v1/telemetry/gate-verify` | Verify an RFID tag at the gate. |
| **POST** | `/api/v1/telemetry/weighbridge` | Record a gross or tare weighbridge measurement. |
| **POST** | `/api/v1/telemetry/batch-sync` | Flush buffered LittleFS telemetry packets. |

## Request Shapes

### `POST /api/v1/bookings/create`

```json
{
  "farmerName": "Harpreet Singh",
  "farmerPhone": "+91 98140 12345",
  "farmerVillage": "Taraori",
  "farmerLat": 29.6857,
  "farmerLon": 76.9905,
  "mandiId": "mandi-01",
  "slotId": "slot-08",
  "cropType": "Wheat (Sharbati)",
  "cropVariety": "HD-3086",
  "estimatedKg": 2500,
  "vehicleNumber": "HR-05-AB-7721",
  "rfidTag": "UHF-TAG-891024"
}
```

### `POST /api/v1/telemetry/gate-verify`

```json
{
  "rfid_tag": "UHF-TAG-891024",
  "device_id": "ESP32-GATE-NODE-01"
}
```

### `POST /api/v1/telemetry/weighbridge`

```json
{
  "booking_id": "BK-2026-001",
  "rfid_tag": "UHF-TAG-891024",
  "weight_kg": 6450,
  "measurement_type": "GROSS",
  "moisture_percentage": 11.8,
  "device_id": "ESP32-SCALE-NODE-01",
  "source": "LIVE_SENSOR_ADC"
}
```

`measurement_type` is `GROSS` or `TARE`; `source` is `LIVE_SENSOR_ADC` or
`LITTLEFS_BUFFER`.

### `POST /api/v1/telemetry/batch-sync`

```json
{
  "packets": [
    {
      "booking_id": "BK-2026-001",
      "weight_kg": 6450,
      "measurement_type": "GROSS",
      "device_id": "ESP32-SCALE-NODE-01",
      "source": "LITTLEFS_BUFFER",
      "timestamp": "2026-11-19T07:00:00.000Z"
    }
  ]
}
```

Telemetry routes also accept `x-forwarded-for` and `x-device-id` headers for
per-IP and per-device rate limiting. Current limits are in-memory (100 req/min
per IP, 50 req/min per device).

## Response Shapes

Responses follow the TypeScript interfaces in `src/shared/types.ts`
(`Mandi`, `Slot`, `Booking`, `TelemetryLog`). Booking objects use camelCase
fields such as `farmerName`, `estimatedKg`, `rfidTag`, `actualNetKg`, and
`totalPayoutInr`.

Errors use the standard shape:

```json
{ "error": "Message describing the problem" }
```
