/*
  MandiSync Gate Node
  Target: ESP32 Dev Module / NodeMCU-32S
  Role: Read UHF RFID → POST /api/v1/telemetry/gate-verify → open barrier

  This file lives in hardware/ only. The website never embeds this source.

  Wiring (default):
    RFID UART2:  RX2 GPIO16, TX2 GPIO17
    Barrier relay: GPIO23 (active HIGH)
    Green LED: GPIO18   Red LED: GPIO19   Buzzer: GPIO5

  Libraries: ArduinoJson, WiFi/HTTPClient/LittleFS (core)
  Config: copy shared/config.example.h → shared/config.h (not in git)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include "config.h"
#include "../shared/littlefs_buffer.h"

#define PIN_RFID_RX       16
#define PIN_RFID_TX       17
#define PIN_BARRIER_RELAY 23
#define PIN_LED_GREEN     18
#define PIN_LED_RED       19
#define PIN_BUZZER        5

HardwareSerial rfidSerial(2);
unsigned long lastWifiCheck = 0;
const unsigned long WIFI_RETRY_INTERVAL = 5000;

void connectWiFi();
void checkRfidReader();
bool sendGateVerifyRequest(const String& rfidTag);
void triggerBarrierGate(bool open);
void flushLittleFsBuffer();
void buzzBeep(int times, int durationMs);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("\n[MandiSync] Gate node booting..."));

  pinMode(PIN_BARRIER_RELAY, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BARRIER_RELAY, LOW);
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_BUZZER, LOW);

  rfidSerial.begin(115200, SERIAL_8N1, PIN_RFID_RX, PIN_RFID_TX);

  if (!LittleFS.begin(true)) {
    Serial.println(F("[ERROR] LittleFS failed."));
  } else {
    flushLittleFsBuffer();
  }

  connectWiFi();
  Serial.println(F("[READY] Gate node ready."));
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

  checkRfidReader();
  delay(20);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("[NET] Connecting to %s...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[NET] Connected. IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(PIN_LED_RED, LOW);
  } else {
    Serial.println(F("\n[WARN] Wi-Fi failed. Offline buffer mode."));
    digitalWrite(PIN_LED_RED, HIGH);
  }
}

void checkRfidReader() {
  if (!rfidSerial.available()) return;
  String rawTag = rfidSerial.readStringUntil('\n');
  rawTag.trim();
  if (rawTag.length() < 4) return;
  Serial.printf("[RFID] Tag: %s\n", rawTag.c_str());
  buzzBeep(1, 100);
  sendGateVerifyRequest(rawTag);
}

bool sendGateVerifyRequest(const String& rfidTag) {
  JsonDocument doc;
  doc["rfid_tag"] = rfidTag;
  doc["device_id"] = DEVICE_ID;

  if (WiFi.status() != WL_CONNECTED) {
    bufferOfflinePacket("GATE_VERIFY", doc);
    return false;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/v1/telemetry/gate-verify";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  // Phase H2: also set X-Device-Id / X-Device-Timestamp / X-Device-Signature

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);

  if (code == 200 || code == 201) {
    String response = http.getString();
    JsonDocument res;
    deserializeJson(res, response);
    bool open = res["gate_open"] | false;
    int pulseMs = res["barrier_pulse_duration_ms"] | 8000;
    if (open) {
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_LED_RED, LOW);
      buzzBeep(2, 80);
      triggerBarrierGate(true);
      delay(pulseMs);
      triggerBarrierGate(false);
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
    } else {
      buzzBeep(3, 250);
    }
    http.end();
    return true;
  }

  Serial.printf("[API-ERROR] HTTP %d — buffering.\n", code);
  bufferOfflinePacket("GATE_VERIFY", doc);
  http.end();
  return false;
}

void triggerBarrierGate(bool open) {
  digitalWrite(PIN_BARRIER_RELAY, open ? HIGH : LOW);
}

void flushLittleFsBuffer() {
  // Full batch-sync flush pattern is the same as scale_node.ino.
  // Gate events may also be buffered; send as packets to
  // POST /api/v1/telemetry/batch-sync when the server accepts GATE type,
  // or re-POST individually. Left as an integration task.
}

void buzzBeep(int times, int durationMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < times - 1) delay(80);
  }
}
