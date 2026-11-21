# MandiSync Hardware

🔌 **What this is:** All ESP32 device code and wiring docs.  
🚫 **Website rule:** The web app never shows firmware, serial ports, or a virtual bench. Devices talk only to the server API.

## Nodes

| Node | Job | Code |
|------|-----|------|
| **Gate node** | Read UHF RFID → call `gate-verify` → open barrier | `gate-node/gate_node.ino` |
| **Scale node** | Read HX711 load cell → call `weighbridge` (GROSS/TARE) | `scale-node/scale_node.ino` |

## How devices talk to the server

Read **[PROTOCOL.md](./PROTOCOL.md)** first. Summary:

1. Copy `shared/config.example.h` → `shared/config.h` and fill Wi‑Fi, server URL, device id, device secret.
2. Sign each request with HMAC (see protocol).
3. If Wi‑Fi drops, buffer JSON lines in LittleFS and flush via `batch-sync`.

The website only **displays** what the server stored. It is not in the path between ESP32 and API.

## Quick links

- [PROTOCOL.md](./PROTOCOL.md) — endpoints and message shapes  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — flash order and keys  
- [tools/simulate_device.py](./tools/simulate_device.py) — fake a device without hardware  
- [test-checklist.md](./test-checklist.md) — physical checklist  

## Baby recap

- Firmware lives **here**, not in the Next.js app.  
- Two boxes: gate + scale.  
- They only call HTTPS APIs on the server.  
- Never commit real Wi‑Fi passwords or device secrets.
