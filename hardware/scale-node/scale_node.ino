/*
  MandiSync Scale Node
  Target: ESP32 Dev Module
  Role: Read HX711 load cell → POST /api/v1/telemetry/weighbridge (GROSS/TARE)

  Lives in hardware/ only — not embedded in the website.

  Wiring (default):
    HX711 DOUT: GPIO21
    HX711 SCK:  GPIO22

  Libraries: HX711 (bogde), ArduinoJson, WiFi/HTTPClient/LittleFS
  Config: shared/config.h (from config.example.h)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include "HX711.h"
#include "config.h"
#include "../shared/littlefs_buffer.h"

#define PIN_HX711_DOUT 21
#define PIN_HX711_SCK  22

// Calibrate with a known weight after assembly
const float SCALE_CALIBRATION_FACTOR = 428.5f;

HX711 scale;
unsigned long lastWifiCheck = 0;
const unsigned long WIFI_RETRY_INTERVAL = 5000;

void connectWiFi();
bool sendWeighbridgeTelemetry(const String& rfidTag, float weightKg, const char* type);
void flushLittleFsBuffer();
float readStableKg();

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("\n[MandiSync] Scale node booting..."));

  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  scale.set_scale(SCALE_CALIBRATION_FACTOR);
  scale.tare();

  if (!LittleFS.begin(true)) {
    Serial.println(F("[ERROR] LittleFS failed."));
  }

  connectWiFi();
  Serial.println(F("[READY] Scale node ready."));
  Serial.println(F("[CMD] Send GROSS or TARE over serial to capture a reading."));
}

void loop() {
  if (millis() - lastWifiCheck > WIFI_RETRY_INTERVAL) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      connectWiFi();
    } else {
      flushLittleFsBuffer();
    }
  }

  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "GROSS" || cmd == "TARE") {
      float kg = readStableKg();
      Serial.printf("[SCALE] %s = %.2f kg\n", cmd.c_str(), kg);
      sendWeighbridgeTelemetry("UHF-TAG-REPLACE-ME", kg, cmd.c_str());
    } else if (cmd == "TARE_ZERO") {
      scale.tare();
      Serial.println(F("[SCALE] Zeroed."));
    }
  }

  delay(50);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\n[NET] Connected." : "\n[WARN] Offline mode.");
}

float readStableKg() {
  // Average a few readings for stability
  return scale.get_units(5);
}

bool sendWeighbridgeTelemetry(const String& rfidTag, float weightKg, const char* type) {
  JsonDocument doc;
  doc["rfid_tag"] = rfidTag;
  doc["weight_kg"] = weightKg;
  doc["measurement_type"] = type; // GROSS | TARE
  doc["device_id"] = DEVICE_ID;
  doc["source"] = "LIVE_SENSOR_ADC";

  if (WiFi.status() != WL_CONNECTED) {
    bufferOfflinePacket("WEIGHBRIDGE", doc);
    return false;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/v1/telemetry/weighbridge";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);

  if (code == 200 || code == 201) {
    Serial.println(http.getString());
    http.end();
    return true;
  }

  Serial.printf("[API-ERROR] HTTP %d — buffering.\n", code);
  bufferOfflinePacket("WEIGHBRIDGE", doc);
  http.end();
  return false;
}

void flushLittleFsBuffer() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (!LittleFS.exists(OFFLINE_LOG_PATH)) return;

  File file = LittleFS.open(OFFLINE_LOG_PATH, FILE_READ);
  if (!file || file.size() == 0) {
    if (file) file.close();
    return;
  }

  JsonDocument batchDoc;
  JsonArray array = batchDoc["packets"].to<JsonArray>();
  int packetCount = 0;

  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() <= 2) continue;
    JsonDocument packet;
    if (deserializeJson(packet, line) == DeserializationError::Ok) {
      // Prefer the inner payload if present
      if (packet["payload"].is<JsonObject>()) {
        array.add(packet["payload"]);
      } else {
        array.add(packet);
      }
      packetCount++;
    }
  }
  file.close();

  if (packetCount == 0) return;

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/v1/telemetry/batch-sync";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  String body;
  serializeJson(batchDoc, body);
  int code = http.POST(body);

  if (code == 200 || code == 201) {
    Serial.printf("[SYNC] Flushed %d packets.\n", packetCount);
    LittleFS.remove(OFFLINE_LOG_PATH);
  } else {
    Serial.printf("[SYNC FAILED] HTTP %d\n", code);
  }
  http.end();
}
