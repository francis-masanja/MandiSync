// Copy this file to config.h and fill real values.
// config.h must NEVER be committed to git.

#pragma once

// Wi-Fi
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// MandiSync server (no trailing slash)
#define API_BASE_URL  "http://localhost:3000"

// Unique per physical node
#define DEVICE_ID     "GATE-01"

// Shared secret for HMAC (see PROTOCOL.md)
#define DEVICE_SECRET "CHANGE_ME_TO_LONG_RANDOM_STRING"
