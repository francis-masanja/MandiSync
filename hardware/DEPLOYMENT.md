# Hardware Deployment

🚀 **What this is:** How to put code on an ESP32 and hook it to MandiSync.  
👥 **Who should read:** Whoever installs gate or scale nodes.

## Before you flash

1. Working Wi‑Fi 2.4 GHz at the mandi.
2. Server URL that the ESP32 can reach (same LAN or public HTTPS).
3. Device secret string (generate with `tools/make_device_key.sh`).
4. Arduino IDE or PlatformIO with ESP32 board support.

## Libraries (Arduino Library Manager)

- ArduinoJson (v6 or v7)
- HX711 by bogde (scale node)
- WiFi, HTTPClient, LittleFS (ESP32 core built-in)

## Steps

1. Copy `shared/config.example.h` to `shared/config.h`.
2. Fill `WIFI_SSID`, `WIFI_PASSWORD`, `API_BASE_URL`, `DEVICE_ID`, `DEVICE_SECRET`.
3. Open `gate-node/gate_node.ino` or `scale-node/scale_node.ino`.
4. Select board **ESP32 Dev Module**, correct COM port, Upload.
5. Open Serial Monitor at **115200** — wait for `[READY]`.
6. Register the device with the manager (when `/admin/devices` exists) or add the secret on the server by hand for now.
7. Run `tools/simulate_device.py` first if you want to test the API without hardware.

## Security

- Never commit `config.h`.
- Never hardcode Wi‑Fi or HMAC secrets in `.ino` files in git.
- Rotate a device secret if a board is stolen.

## Baby recap

- Fill `config.h` locally → upload sketch → watch serial.  
- Test API with the Python simulator first.  
- Secrets stay out of git.
