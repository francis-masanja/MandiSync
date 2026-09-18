export const ARDUINO_FIRMWARE_INO = `/*
  =============================================================================
  MandiSync Smart Agricultural Queue & Gate Automation Firmware
  Target Platform: ESP32 Dev Module / NodeMCU-32S
  Author: MandiSync Principal Embedded Systems Engineering
  =============================================================================

  Hardware Peripherals:
  - UHF RFID Reader (e.g., JT-8290 / R2000 compatible module) -> UART Serial2
      * ESP32 RX2 (GPIO 16) -> RFID TX
      * ESP32 TX2 (GPIO 17) -> RFID RX
  - HX711 24-bit ADC + S-type Load Cell (Weighbridge Platform):
      * DOUT (GPIO 21)
      * SCK  (GPIO 22)
  - Barrier Gate Relay / High-Current Solenoid:
      * Relay Pin (GPIO 23) [Active HIGH]
  - Status Indicators:
      * Green LED (GPIO 18) - Access Granted / Scale Settled
      * Red LED   (GPIO 19) - Access Denied / Standby
      * Buzzer    (GPIO 5)  - Audio confirmation beep

  Dependencies (Install via Arduino Library Manager):
  - ArduinoJson (v7.x or v6.x) by Benoit Blanchon
  - HX711 by bogde
  - WiFi, HTTPClient, WiFiClientSecure, LittleFS (ESP32 Core Built-in)
  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include "HX711.h"

// --- NETWORK CONFIGURATION ---
const char* WIFI_SSID     = "Mandi_Secure_AP";
const char* WIFI_PASSWORD = "AgriTech@2026";

// MandiSync Cloud API Host (Replace with your deployed app URL or LAN IP)
const char* API_BASE_URL  = "https://ais-dev-f6o3blia6e5a7a4vtikzw3-685943469126.asia-east1.run.app";
const char* GATE_DEVICE_ID = "ESP32-MANDI-GATE-01";

// --- PIN ASSIGNMENTS ---
#define PIN_RFID_RX       16
#define PIN_RFID_TX       17
#define PIN_HX711_DOUT    21
#define PIN_HX711_SCK     22
#define PIN_BARRIER_RELAY 23
#define PIN_LED_GREEN     18
#define PIN_LED_RED       19
#define PIN_BUZZER        5

// --- SENSOR OBJECTS ---
HX711 scale;
HardwareSerial rfidSerial(2);

// Scale Calibration Factor (Adjust after calibrating with known 50kg test weight)
const float SCALE_CALIBRATION_FACTOR = 428.5f; 

// LittleFS Offline Buffer Path
const char* OFFLINE_LOG_PATH = "/offline_queue.json";

// Timing intervals
unsigned long lastWifiCheck = 0;
const unsigned long WIFI_RETRY_INTERVAL = 5000;

// Function Prototypes
void setupHardware();
void connectWiFi();
void checkRfidReader();
void processWeighbridgeScale();
bool sendGateVerifyRequest(const String& rfidTag);
bool sendWeighbridgeTelemetry(const String& rfidTag, float weightKg, const char* mode);
void triggerBarrierGate(bool open);
void logToLittleFS(const String& payloadType, const JsonDocument& doc);
void flushLittleFsBuffer();
void buzzBeep(int times, int durationMs);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("\\n\\n=============================================="));
  Serial.println(F("     MANDISYNC GATEWAY CONTROLLER BOOTING     "));
  Serial.println(F("=============================================="));

  setupHardware();

  // Initialize LittleFS Flash Storage for Offline Telemetry Resiliency
  if (!LittleFS.begin(true)) {
    Serial.println(F("[ERROR] LittleFS initialization failed! Flash storage offline."));
  } else {
    Serial.println(F("[OK] LittleFS mounted successfully."));
    // Attempt to flush buffered telemetry from previous outages
    flushLittleFsBuffer();
  }

  // Connect to Wi-Fi
  connectWiFi();
  Serial.println(F("[READY] MandiSync Controller ready for vehicle queue telemetry."));
}

void loop() {
  // Periodically check and reconnect Wi-Fi if dropped
  if (millis() - lastWifiCheck > WIFI_RETRY_INTERVAL) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println(F("[WARN] Wi-Fi lost. Operating in LittleFS Offline Buffering mode."));
      connectWiFi();
    } else {
      // If reconnected, flush any buffered offline telemetry
      flushLittleFsBuffer();
    }
  }

  // Check UART2 for RFID vehicle card/tag scans
  checkRfidReader();

  // Listen to USB Serial commands for calibration or manual triggers
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.startsWith("VERIFY:")) {
      String tag = cmd.substring(7);
      Serial.printf("[USB-CMD] Manual Verify RFID: %s\\n", tag.c_str());
      sendGateVerifyRequest(tag);
    } else if (cmd.startsWith("SCALE:")) {
      float weight = cmd.substring(6).toFloat();
      Serial.printf("[USB-CMD] Manual Weighbridge Test: %.1f kg\\n", weight);
      sendWeighbridgeTelemetry("UHF-TAG-882190", weight, "AUTO");
    } else if (cmd == "TARE") {
      scale.tare();
      Serial.println(F("[USB-CMD] Scale zero tare calibrated."));
    } else if (cmd == "GATE:OPEN") {
      triggerBarrierGate(true);
    } else if (cmd == "GATE:CLOSE") {
      triggerBarrierGate(false);
    }
  }

  delay(20);
}

void setupHardware() {
  // Pin modes
  pinMode(PIN_BARRIER_RELAY, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  digitalWrite(PIN_BARRIER_RELAY, LOW); // Barrier down/closed
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, HIGH);     // Standby red indicator
  digitalWrite(PIN_BUZZER, LOW);

  // Initialize UART2 for UHF RFID Reader
  rfidSerial.begin(115200, SERIAL_8N1, PIN_RFID_RX, PIN_RFID_TX);
  Serial.println(F("[OK] RFID UART2 initialized on pins 16 (RX) / 17 (TX)."));

  // Initialize HX711 Scale
  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  scale.set_scale(SCALE_CALIBRATION_FACTOR);
  scale.tare(); // Reset scale to 0
  Serial.println(F("[OK] HX711 24-bit ADC initialized on pins 21/22."));
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[NET] Connecting to Wi-Fi SSID: %s ...\\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\\n[NET] Wi-Fi connected! IP: %s | RSSI: %d dBm\\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
    digitalWrite(PIN_LED_RED, LOW);
  } else {
    Serial.println(F("\\n[WARN] Wi-Fi connection timed out. Fallback to LittleFS buffering."));
    digitalWrite(PIN_LED_RED, HIGH);
  }
}

void checkRfidReader() {
  if (rfidSerial.available()) {
    String rawTag = rfidSerial.readStringUntil('\\n');
    rawTag.trim();
    if (rawTag.length() >= 4) {
      Serial.printf("[RFID] Vehicle Tag Detected: %s\\n", rawTag.c_str());
      buzzBeep(1, 100);
      sendGateVerifyRequest(rawTag);
    }
  }
}

bool sendGateVerifyRequest(const String& rfidTag) {
  JsonDocument doc;
  doc["rfid_tag"] = rfidTag;
  doc["device_id"] = GATE_DEVICE_ID;
  doc["timestamp"] = millis();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[OFFLINE] No Wi-Fi. Queuing gate request to LittleFS."));
    logToLittleFS("GATE_VERIFY", doc);
    return false;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/v1/telemetry/gate-verify";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.printf("[API-GATE] Response: %s\\n", response.c_str());

    JsonDocument resDoc;
    deserializeJson(resDoc, response);
    bool gateOpen = resDoc["gate_open"] | false;

    if (gateOpen) {
      Serial.println(F("[ACCESS GRANTED] Opening barrier gate."));
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_LED_RED, LOW);
      buzzBeep(2, 80);
      triggerBarrierGate(true);
      delay(8000); // Keep gate open for vehicle clearance
      triggerBarrierGate(false);
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
    } else {
      Serial.println(F("[ACCESS DENIED] Invalid slot or tag not in queue."));
      digitalWrite(PIN_LED_RED, HIGH);
      buzzBeep(3, 250);
    }
    http.end();
    return true;
  } else {
    Serial.printf("[API-ERROR] HTTP code: %d. Buffering to LittleFS.\\n", httpCode);
    logToLittleFS("GATE_VERIFY", doc);
    http.end();
    return false;
  }
}

bool sendWeighbridgeTelemetry(const String& rfidTag, float weightKg, const char* mode) {
  JsonDocument doc;
  doc["rfid_tag"] = rfidTag;
  doc["weight_kg"] = weightKg;
  doc["measurement_type"] = mode;
  doc["device_id"] = "ESP32-SCALE-01";
  doc["timestamp"] = millis();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[OFFLINE] Wi-Fi lost. Logging scale reading to LittleFS."));
    logToLittleFS("WEIGHBRIDGE", doc);
    return false;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/v1/telemetry/weighbridge";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.printf("[API-SCALE] Recorded: %s\\n", response.c_str());
    buzzBeep(1, 150);
    http.end();
    return true;
  } else {
    Serial.printf("[API-SCALE ERROR] Code %d. Buffering.\\n", httpCode);
    logToLittleFS("WEIGHBRIDGE", doc);
    http.end();
    return false;
  }
}

void triggerBarrierGate(bool open) {
  if (open) {
    digitalWrite(PIN_BARRIER_RELAY, HIGH);
    Serial.println(F("[RELAY] Barrier Relay Pin 23 pulled HIGH -> BARRIER OPEN."));
  } else {
    digitalWrite(PIN_BARRIER_RELAY, LOW);
    Serial.println(F("[RELAY] Barrier Relay Pin 23 pulled LOW -> BARRIER CLOSED."));
  }
}

void logToLittleFS(const String& payloadType, const JsonDocument& doc) {
  File file = LittleFS.open(OFFLINE_LOG_PATH, FILE_APPEND);
  if (!file) {
    Serial.println(F("[FS ERROR] Failed to open offline log file for writing."));
    return;
  }

  JsonDocument wrapper;
  wrapper["type"] = payloadType;
  wrapper["payload"] = doc;
  wrapper["logged_at"] = millis();

  serializeJson(wrapper, file);
  file.println();
  file.close();
  Serial.println(F("[FS] Telemetry packet safely buffered in LittleFS flash memory."));
}

void flushLittleFsBuffer() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (!LittleFS.exists(OFFLINE_LOG_PATH)) return;

  File file = LittleFS.open(OFFLINE_LOG_PATH, FILE_READ);
  if (!file || file.size() == 0) {
    if (file) file.close();
    return;
  }

  Serial.println(F("[SYNC] Flushing LittleFS offline buffer to MandiSync cloud..."));

  JsonDocument batchDoc;
  JsonArray array = batchDoc["packets"].to<JsonArray>();

  int packetCount = 0;
  while (file.available()) {
    String line = file.readStringUntil('\\n');
    line.trim();
    if (line.length() > 2) {
      JsonDocument packet;
      deserializeJson(packet, line);
      array.add(packet);
      packetCount++;
    }
  }
  file.close();

  if (packetCount > 0) {
    HTTPClient http;
    String url = String(API_BASE_URL) + "/api/v1/telemetry/batch-sync";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String requestBody;
    serializeJson(batchDoc, requestBody);

    int httpCode = http.POST(requestBody);
    if (httpCode == 200 || httpCode == 201) {
      Serial.printf("[SYNC SUCCESS] Synced %d offline telemetry packets to server.\\n", packetCount);
      LittleFS.remove(OFFLINE_LOG_PATH); // Clear buffered file
      buzzBeep(2, 60);
    } else {
      Serial.printf("[SYNC FAILED] Server returned code %d. Keeping buffer.\\n", httpCode);
    }
    http.end();
  }
}

void buzzBeep(int times, int durationMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < times - 1) delay(80);
  }
}
`;
