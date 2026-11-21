# Phase 4 – Hardware Integration

## Objectives
Connect physical ESP32 devices via the Web Serial API and provide a full provisioning workflow.

## Tasks

| # | Task | Details | Effort |
|---|------|---------|--------|
| 4.1 | **Web Serial in GateControlDesk** | Add "Connect ESP32 Gate" button → requestAndConnectSerial(115200, onLine, onStatus). Live RFID logs, auto‑trigger gate‑verify on tag read. | 1 day |
| 4.2 | **Web Serial in HardwareBench** | Add "Connect ESP32 Scale" button. Live HX711 JSON parsing, weight display, offline buffer indicator. | 1 day |
| 4.3 | **Device provisioning UI** | `/admin/devices` (official‑only): register new ESP32, generate API key, assign `device_id`. Store hash in `devices` table, show plaintext once. | 1 day |
| 4.4 | **Firmware flash guide** | Create `docs/hardware/firmware-flash.md` with PlatformIO (`platformio.ini`) and Arduino IDE steps. Include Wi‑Fi, API base URL, device ID, API key placeholders. | 0.5 day |
| 4.5 | **E2E hardware test** | Physical test: RFID tag → gate verify → barrier → weighbridge (gross → tare) → batch sync. Document test steps and expected logs. | 1 day |

## Web Serial Integration (re‑use `lib/web-serial.ts`)
```ts
// GateControlDesk additions
<button onClick={connectGate}>Connect ESP32 Gate</button>

async function connectGate() {
  await requestAndConnectSerial(115200, handleGateLine, handleGateStatus);
}

function handleGateLine(line: string) {
  // Expected format: {"rfid":"0xABC123"}
  const data = JSON.parse(line);
  if (data.rfid) {
    // Auto‑trigger gate verification API call
    verifyGate(data.rfid);
  }
}
```
```ts
// HardwareBench additions
<button onClick={connectScale}>Connect ESP32 Scale</button>

async function connectScale() {
  await requestAndConnectSerial(115200, handleScaleLine, handleScaleStatus);
}

function handleScaleLine(line: string) {
  // Expected format: {"weight":123.45,"stable":true}
  const data = JSON.parse(line);
  updateWeightDisplay(data);
  // Show offline buffer badge if device reports unsynced logs
}
```

## Device Provisioning Flow
1. Official logs in → `/admin/devices`.
2. Click "Register New Device" → input **name** and **type** (`gate` or `scale`).
3. System generates a **device_id** (`ESP32-MANDI‑GATE‑01`).
4. System generates a **one‑time API key** (`mk_${randomBytes(32).toString('hex')}`) and stores a **hash** in the `devices` table.
5. UI shows the plaintext key **once**; user copies it to the ESP32 firmware configuration.
6. Device boots, registers itself via `/api/v1/devices/register` (auth via API key).
7. Device appears in the device list with status `online` / `offline` and `last_seen_at`.

## Firmware Configuration (from `lib/firmware.ts`)
```cpp
// User must update these in the firmware before flashing:
const char* WIFI_SSID = "Mandi_Secure_AP";
const char* WIFI_PASSWORD = "AgriTech@2026";
const char* API_BASE_URL = "https://your-deployment.vercel.app";
const char* GATE_DEVICE_ID = "ESP32-MANDI-GATE-01"; // or SCALE_DEVICE_ID
const char* API_KEY = "mk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // from provisioning UI
```

## Firmware Flash Guide (`docs/hardware/firmware-flash.md`)
```markdown
# ESP32 Firmware Flash Guide

## Prerequisites
- PlatformIO Core (`pip install platformio`) **or** Arduino IDE 2.x
- ESP32‑DevKitC (or compatible board)
- USB cable (data capable)

## 1. Clone the firmware repo
```bash
git clone https://github.com/yourorg/mandi-firmware.git
cd mandi-firmware
```

## 2. Update configuration
Edit `src/config.h` and replace the placeholders with the values you obtained from the provisioning UI:
```c
#define WIFI_SSID      "<your‑wifi‑ssid>"
#define WIFI_PASSWORD  "<your‑wifi‑password>"
#define API_BASE_URL   "https://<your‑vercel‑deployment>.vercel.app"
#define DEVICE_ID      "<device_id from UI>"
#define API_KEY        "<api_key from UI>"
```

## 3. Build & flash with PlatformIO
```bash
pio run -t upload   # detects the connected USB port automatically
```

## 4. Build & flash with Arduino IDE
1. Open `src/firmware.ino`.
2. Select **Tools → Board → ESP32 Dev Module**.
3. Select the correct **Port**.
4. Click the **Upload** button.

## 5. Verify connection
- Open the Serial Monitor (115200 baud).
- You should see `{"status":"connected"}` followed by live JSON payloads.
- The device will now appear on the **Device Management** page in the web UI.
```

## E2E Hardware Test (Physical)
1. Connect an RFID tag to the **Gate ESP32** and scan it.
2. Verify that the UI shows the tag, calls `/api/v1/telemetry/gate-verify`, and the barrier animation runs.
3. Connect a load cell to the **Scale ESP32**. Input a known weight (e.g., 5 kg) → ensure UI displays the correct weight.
4. Press **Gross** → then **Tare** → verify that the booking in the DB records both values and calculates `actual_net_kg`.
5. Trigger the **Batch Sync** endpoint and confirm the `offline_buffers` table is emptied.
6. Check the `telemetry_logs` table for timestamps and payloads.

---

## Decision Log
- **Device provisioning**: official‑only UI, API key generated server‑side, hash stored in DB.
- **Web Serial**: use the existing `requestAndConnectSerial` helper, no additional dependencies.
- **Firmware**: simple HTTP client (Arduino `HTTPClient`) with HMAC auth for telemetry posts.
