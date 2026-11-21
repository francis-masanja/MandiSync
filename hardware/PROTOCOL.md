# MandiSync Device Protocol

🧠 **What this is:** The contract between ESP32 nodes and the MandiSync server.  
👥 **Who should read:** Anyone flashing a device or changing telemetry APIs.

The website is **not** part of this contract. Only the server API is.

---

## Base URL

```text
{API_BASE_URL}/api/v1/...
```

Examples:

- Local dev: `http://localhost:3000`
- Deployed: your HTTPS app URL (no trailing slash)

---

## Device authentication (HMAC)

Every device request must include:

| Header | Value |
|--------|--------|
| `Content-Type` | `application/json` |
| `X-Device-Id` | e.g. `GATE-01`, `SCALE-01` |
| `X-Device-Timestamp` | Unix seconds (string or number) |
| `X-Device-Signature` | HMAC-SHA256 hex |

### Signature string

```text
HMAC_SHA256(device_secret, METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + BODY)
```

Example for gate-verify:

```text
POST
/api/v1/telemetry/gate-verify
1730000000
{"rfid_tag":"UHF-TAG-123","device_id":"GATE-01"}
```

**Clock skew:** server rejects timestamps more than **300 seconds** old or far in the future.

> **Status:** Server-side HMAC verification is planned (Phase H2). Until it ships, endpoints still expect the JSON body below; send headers early so firmware is ready.

---

## Endpoints

### 1) Gate verify

`POST /api/v1/telemetry/gate-verify`

**Request:**

```json
{
  "rfid_tag": "UHF-TAG-891024",
  "device_id": "GATE-01"
}
```

**Response (allowed):**

```json
{
  "gate_open": true,
  "barrier_pulse_duration_ms": 15000,
  "booking": { "id": "BK-...", "vehicleNumber": "HR-05-AB-7721" },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

**Response (denied):**

```json
{
  "gate_open": false,
  "message": "No active booking",
  "barrier_pulse_duration_ms": 0
}
```

Firmware should open the barrier only when `gate_open === true`.

---

### 2) Weighbridge

`POST /api/v1/telemetry/weighbridge`

**Request:**

```json
{
  "rfid_tag": "UHF-TAG-891024",
  "booking_id": "optional-uuid-or-BK-id",
  "weight_kg": 6450,
  "measurement_type": "GROSS",
  "moisture_percentage": 11.8,
  "device_id": "SCALE-01",
  "source": "LIVE_SENSOR_ADC"
}
```

| Field | Notes |
|-------|--------|
| `measurement_type` | `GROSS` or `TARE` |
| `source` | `LIVE_SENSOR_ADC` or `LITTLEFS_BUFFER` |
| `weight_kg` | Must be > 0 |
| `booking_id` **or** `rfid_tag` | How the server finds the queue entry |

**Response:**

```json
{
  "success": true,
  "netKg": 2500,
  "message": "GROSS weight of 6450kg successfully recorded.",
  "booking": { "status": "WEIGHED_GROSS" }
}
```

---

### 3) Batch sync (offline catch-up)

`POST /api/v1/telemetry/batch-sync`

**Request:**

```json
{
  "packets": [
    {
      "rfid_tag": "UHF-TAG-891024",
      "weight_kg": 6450,
      "measurement_type": "GROSS",
      "device_id": "SCALE-01",
      "source": "LITTLEFS_BUFFER",
      "timestamp": "2026-10-29T10:00:00.000Z"
    }
  ]
}
```

- Max **1000** packets per call  
- `timestamp` must be ISO-8601 with offset  

**Response:**

```json
{
  "success": true,
  "syncedCount": 1,
  "message": "Successfully flushed 1 offline LittleFS records into central ledger"
}
```

---

### 4) Device heartbeat (planned)

`POST /api/v1/devices/heartbeat`

```json
{ "device_id": "GATE-01", "firmware": "1.0.0", "rssi_dbm": -62, "uptime_s": 1234 }
```

Manager dashboard will show last-seen from this.

---

## Offline mode (LittleFS)

1. If `WiFi.status() != WL_CONNECTED`, append one JSON line per event to `/offline_queue.json`.
2. On reconnect, POST all lines as `packets` to `batch-sync`.
3. Delete the buffer file only after HTTP 200/201.

Use a unique `packet_id` (UUID or millis+random) when the server adds idempotency.

---

## Errors

| HTTP | Meaning |
|------|---------|
| 400 | Bad JSON / failed Zod schema |
| 401 | Missing/invalid device auth (after H2) |
| 404 | No matching booking |
| 429 | Rate limited — back off and retry |
| 500 | Server error — buffer to LittleFS |

---

## Baby recap

- Devices speak **HTTPS + JSON** to the server only.  
- Sign requests with **HMAC** using the device secret.  
- Gate: `gate-verify` → open barrier if `gate_open`.  
- Scale: `weighbridge` with GROSS then TARE.  
- No Wi‑Fi? Save to flash and `batch-sync` later.  
- The website never appears in this flow.
