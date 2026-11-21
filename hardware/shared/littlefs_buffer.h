// LittleFS offline buffer helpers (pattern used by both nodes).
// Append one JSON object per line; flush via batch-sync when online.

#pragma once
#include <Arduino.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

#ifndef OFFLINE_LOG_PATH
#define OFFLINE_LOG_PATH "/offline_queue.json"
#endif

inline void bufferOfflinePacket(const String& payloadType, const JsonDocument& doc) {
  File file = LittleFS.open(OFFLINE_LOG_PATH, FILE_APPEND);
  if (!file) {
    Serial.println(F("[FS ERROR] Cannot open offline log."));
    return;
  }
  JsonDocument wrapper;
  wrapper["type"] = payloadType;
  wrapper["payload"] = doc;
  wrapper["logged_at"] = millis();
  serializeJson(wrapper, file);
  file.println();
  file.close();
  Serial.println(F("[FS] Packet buffered offline."));
}
