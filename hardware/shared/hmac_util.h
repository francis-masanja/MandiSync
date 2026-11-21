// Minimal HMAC-SHA256 helper sketch for ESP32 (Arduino).
// Prefer using a battle-tested crypto library in production.
// This file documents the signature string format used by PROTOCOL.md.

#pragma once
#include <Arduino.h>

// signature_data = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + BODY
// signature = HMAC_SHA256(device_secret, signature_data) as lowercase hex
//
// On ESP32 you can implement HMAC-SHA256 with mbedtls (built into ESP-IDF)
// or an Arduino HMAC library. Keep the exact string format above so the
// server can verify.

inline String buildSignaturePayload(const String& method, const String& path,
                                    const String& timestamp, const String& body) {
  return method + "\n" + path + "\n" + timestamp + "\n" + body;
}
