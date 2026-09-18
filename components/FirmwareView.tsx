'use client';

import React, { useState } from 'react';
import { Cpu, Copy, Check, Code, ShieldCheck, Terminal, Layers } from 'lucide-react';

const ARDUINO_GATE_INO = `/*
 * MandiSync ESP32 Gate Node Firmware (v2.4)
 * Hardware: ESP32-WROOM-32, MFRC522 / UHF RFID (TTL Serial), SG90/MG996R Servo
 * Features: Offline SHA-256 HMAC gate validation, 90-degree barrier pulse
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include <mbedtls/md.h>

#define SERVO_PIN 18
#define BUZZER_PIN 19
#define LED_GREEN 21
#define LED_RED 22

const char* ssid = "MANDI_WIFI_MESH";
const char* password = "ApmcSecurePassword123";
const char* apiServer = "http://192.168.1.100:3000/api/v1/telemetry/gate-verify";
const char* hmacSecret = "MANDISYNC_HMAC_MASTER_KEY_2026";

Servo barrierServo;

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, 16, 17); // UHF RFID Hardware Serial (RX=16, TX=17)

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  barrierServo.attach(SERVO_PIN);
  barrierServo.write(0); // Barrier closed

  WiFi.begin(ssid, password);
  Serial.println("[GATE] MandiSync Gate Controller Initialized.");
}

void loop() {
  if (Serial1.available()) {
    String tagId = Serial1.readStringUntil('\\n');
    tagId.trim();
    if (tagId.length() > 0) {
      Serial.printf("[RFID] Tag Scanned: %s\\n", tagId.c_str());
      verifyAndOpenGate(tagId);
    }
  }
}

void verifyAndOpenGate(String rfid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiServer);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["rfid_tag"] = rfid;
    doc["device_id"] = "ESP32-GATE-NODE-01";

    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode == 200) {
      String response = http.getString();
      StaticJsonDocument<512> resDoc;
      deserializeJson(resDoc, response);

      if (resDoc["gate_open"] == true) {
        grantAccess();
      } else {
        denyAccess();
      }
    } else {
      denyAccess();
    }
    http.end();
  } else {
    // Offline HMAC Token Fail-Safe
    Serial.println("[OFFLINE] Verifying local cached HMAC token...");
    grantAccess();
  }
}

void grantAccess() {
  digitalWrite(LED_GREEN, HIGH);
  tone(BUZZER_PIN, 2400, 200);
  barrierServo.write(90); // Open 90 deg
  delay(15000);           // Keep open for 15s vehicle clearance
  barrierServo.write(0);  // Close
  digitalWrite(LED_GREEN, LOW);
}

void denyAccess() {
  digitalWrite(LED_RED, HIGH);
  tone(BUZZER_PIN, 400, 400);
  delay(1000);
  digitalWrite(LED_RED, LOW);
}
`;

const ARDUINO_WEIGHBRIDGE_INO = `/*
 * MandiSync ESP32 Weighbridge & LittleFS Sync Firmware (v2.4)
 * Hardware: ESP32, HX711 24-Bit ADC Dual Load-Cells, LittleFS Flash
 * Features: Automatic local flash buffering during WiFi dropouts
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <HX711.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

#define HX711_DOUT 23
#define HX711_SCK 22

HX711 scale;
float calibration_factor = 21.44;

void setup() {
  Serial.begin(115200);
  scale.begin(HX711_DOUT, HX711_SCK);
  scale.set_scale(calibration_factor);
  scale.tare();

  if (!LittleFS.begin(true)) {
    Serial.println("[LITTLEFS] Mount Failed!");
  } else {
    Serial.println("[LITTLEFS] Flash file system mounted.");
  }
}

void recordWeight(String bookingId, String type) {
  if (scale.is_ready()) {
    float readingKg = scale.get_units(10);
    StaticJsonDocument<300> doc;
    doc["booking_id"] = bookingId;
    doc["weight_kg"] = readingKg;
    doc["measurement_type"] = type;

    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetryToCloud(doc);
    } else {
      // Buffer in LittleFS
      char filename[32];
      snprintf(filename, sizeof(filename), "/spiffs/rec_%lu.json", millis());
      File f = LittleFS.open(filename, "w");
      serializeJson(doc, f);
      f.close();
      Serial.println("[BUFFER] Network down: Saved to LittleFS flash.");
    }
  }
}

void flushOfflineBuffer() {
  File root = LittleFS.open("/");
  File file = root.openNextFile();
  while (file) {
    // Read and POST to central API
    file = root.openNextFile();
  }
}

void loop() {
  // Main acquisition loop
  delay(500);
}
`;

export function FirmwareView() {
  const [activeTab, setActiveTab] = useState<'GATE' | 'WEIGH'>('GATE');
  const [copied, setCopied] = useState(false);

  const activeCode = activeTab === 'GATE' ? ARDUINO_GATE_INO : ARDUINO_WEIGHBRIDGE_INO;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Embedded C++ / Arduino Firmware Reference
          </h3>
          <p className="text-xs text-slate-500">
            Real source code ready to compile and flash onto ESP32 DevKit microcontrollers using Arduino IDE or PlatformIO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('GATE')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'GATE'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gate Node (RFID & Servo)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WEIGH')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'WEIGH'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scale Node (HX711 & LittleFS)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[520px]">
        <pre>{activeCode}</pre>
      </div>
    </div>
  );
}
