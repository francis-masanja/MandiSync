# Smart Mandi Dynamic Queue & Telemetry System (SIH26032)

> **LOVELY PROFESSIONAL UNIVERSITY, PUNJAB**  
> **School of Computer Applications**  
> **Course Code:** CAP205 | **Course Title:** NEXT GEN PROJECT 1  
> **Academic Task Number:** 1 | **Academic Task Type:** ASSIGNMENT  
> **Maximum Marks:** 30 | **Date of Submission:** 07-09-2026  
> **Course Outcome:** CO1 (Problem Identification & Requirements Analysis) | **Bloom's Level:** L3 (Apply)  

---

## 📋 Academic & Team Details

| Attribute | Details |
| :--- | :--- |
| **Problem Statement ID** | SIH26032 |
| **Nodal Ministry** | Ministry of Consumer Affairs, Food & Public Distribution |
| **Project Domain** | Smart Automation / High-Performance Software & IoT Systems |

### Student Details
| Name | Registration No. | Roll No. |
| :--- | :---: | :---: |
| **Francis Masanja** | 12529273 | 50 |
| **Victoria Joshua** | 12524596 | 40 |
| **Minza Aaron** | 12529800 | 51 |
| **Amro Mohammed** | 12530529 | 61 |
| **Omer Elusharef** | — | — |

---

## 1. Problem Identification

### 1.0 Simple Explanations

During peak harvest seasons, thousands of farmers arrive at agricultural procurement centers (*Mandis*) simultaneously. This leads to massive traffic bottlenecks, forcing farmers to wait in queues for **24 to 72 hours**. Additional challenges include zero visibility into queue lengths or mandi storage limits, crop spoilage due to rain and heat, and manual verification/weighing errors.

#### Core Concept Shift

```
[ OLD WAY ]
Farmer ──> Mandi Gate ──> Massive Queue (24-72h Wait) ──> Manual Check ──> Manual Weight ──> Error Prone

[ NEW WAY ]
Farmer ──> Book Time Slot ──> Instant Confirmation ──> Arrive on Time ──> RFID Auto-ID ──> Auto Weighing ──> Digital Record
```

#### How the System Works (Farmer's Perspective)
1. **Booking:** The farmer opens the Progressive Web App (PWA) or sends an SMS entering:
   - Farmer ID
   - Crop Type
   - Estimated Quantity
   - Location (GPS / Pin)
2. **Scheduling:** The system assigns a guaranteed, conflict-free arrival time slot.
3. **Automated Processing:** Upon arrival, long-range RFID readers and digital weighbridges identify the vehicle and record net grain weight automatically.

---

### 1.1 Context & Operational Background
During peak procurement seasons (Rabi and Kharif harvests), agricultural procurement centers (*Mandis*) across India experience high-density vehicle and harvest traffic. Millions of metric tons of grain are delivered daily, requiring gate authentication, moisture testing, weighbridge measurement, and digital procurement logging before state procurement execution.

---

### 1.2 Core Problem Statement
Farmers endure severe, unmanaged queue bottlenecks resulting in 24 to 72 hours of forced waiting time, complete lack of transparent scheduling data, and operational uncertainty regarding procurement acceptance.

#### Key Structural Failure Points:
* **Unregulated Queue Spikes:** Massive concurrent tractor arrivals during early morning windows (06:00 AM – 08:00 AM) without dynamic slot distribution algorithms.
* **Information Asymmetry:** Zero visibility for farmers regarding real-time mandi storage thresholds, daily processing quotas, or live queue length prior to departure.
* **Crop Degradation & Economic Loss:** Extended exposure of harvested grains to high temperatures or unpredictable rain causes rapid crop deterioration, resulting in direct financial loss to farmers.
* **Manual Verification & Weight Fraud:** Paper-based entry logs and manual weight data entry introduce human error, severe processing latency, and vectors for corruption.

---

### 1.3 Target Project Objectives
* **Dynamic Slot Allocation Engine:** Compute optimal arrival schedules and balance regional mandi loads using distance-weighted constraint algorithms.
* **Multi-Channel Status Notifications:** Provide live status tracking via web-based PWA, automated SMS, and IVRS voice calls for full feature-phone compatibility.
* **Automated Mandi Telemetry:** Eliminate manual weight logging by interfacing digital weighbridges and long-range RFID readers directly with backend storage.

---

## 2. Technology Stack & Architecture

The architecture relies on a high-throughput, asynchronous C++ backend microservice to maintain sub-5ms response latency under peak load conditions.

```
+-----------------------------------------------------------------------------------+
|                               FARMER INTERFACE LAYER                              |
|   React.js PWA (Offline Cache)  |  SMS Gateway (Twilio)  |  IVRS (Voice Gateway)  |
+-----------------------------------------------------------------------------------+
                                          │ (HTTPS / REST API / WebSockets)
                                          ▼
+-----------------------------------------------------------------------------------+
|                           API GATEWAY & LOAD BALANCER                             |
|                           Nginx Reverse Proxy / SSL                               |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                             HIGH-PERFORMANCE CORE ENGINE                          |
|       C++20 Async Microservices (Boost.Asio, nlohmann/json, OpenSSL HMAC)         |
+-----------------------------------------------------------------------------------+
             │                                   │                           │
             │ (SQL / Spatial Queries)           │ (In-Memory Pub/Sub)       │ (MQTT Telemetry)
             ▼                                   ▼                           ▼
+-------------------------+             +---------------------+     +-------------------+
|     DATABASE LAYER      |             |    CACHE ENGINE     |     |  IoT EDGE GATEWAY |
| PostgreSQL 16 + PostGIS |             | Redis 7.x In-Memory |     | Mosquitto Broker  |
+-------------------------+             +---------------------+     +-------------------+
                                                                             │
                                                                             ▼
                                                                    +-------------------+
                                                                    | HARDWARE SENSORS  |
                                                                    | ESP32 + UHF RFID  |
                                                                    | Load Cell + HX711 |
                                                                    +-------------------+
```

---

### 2.1 Component Breakdown & Technical Justification

| Architecture Layer | Component / Tool | Technical Justification |
| :--- | :--- | :--- |
| **High-Performance Backend Core** | C++20 (`Boost.Asio`, `OpenSSL`) | Executes asynchronous socket I/O, dynamic queue placement math, and HMAC cryptographic token generation with sub-5ms processing latency. |
| **API Gateway** | Nginx | Provides SSL termination, rate-limiting protection, and load balancing across server worker threads. |
| **Farmer Web Interface** | React.js (PWA) + Tailwind CSS | Lightweight Progressive Web App featuring Service Worker caching for offline rural operation (`< 50 KB` payload). |
| **Feature Phone Service** | Twilio / Plivo Telephony API | Automates localized SMS alerts and IVRS voice calls for non-smartphone users. |
| **Relational & Spatial Database** | PostgreSQL 16 + PostGIS | Manages persistent data. PostGIS extension handles spatial geospatial distance calculations between farms and mandis. |
| **Volatile Data Caching** | Redis 7.x | Holds real-time queue states, locks, and live capacity counters in memory for high-frequency access. |
| **Mandi Gate Edge Controller** | ESP32 Microcontroller | Dual-core Wi-Fi/BLE MCU at mandi gates reading long-range RFID tags and weighbridge ADC converters. |
| **Vehicle Identification** | UHF RFID Reader (Impinj / Chafon) | Automatically scans passive long-range RFID tags affixed to farmer tractors/trolleys. |
| **Digital Scale Telemetry** | Industrial Load Cells + HX711 ADC | Digitizes mechanical weighbridge force into binary weight readings transmitted over MQTT. |
| **IoT Message Broker** | Eclipse Mosquitto (MQTT) | Lightweight MQTT message broker relaying sensor telemetry between ESP32 gate modules and the C++ engine. |

---

## 3. System Workflow & Integration Sequence

```
[Farmer Booking Request] ──> [C++ Engine] ──> [PostGIS Matrix Evaluation] ──> [HMAC Token & QR Issued]
                                                                                      │
                                                                                      ▼
[Receipt & Exit SMS] <── [Gross Weight Logged] <── [Scale Platform] <── [RFID Reader Gate] <── [Mandi Arrival]
```

---

### 3.1 Step-by-Step Operational Execution

#### Phase 1: Registration & Slot Allocation
1. Farmer submits booking parameters (Farmer ID, crop type, estimated weight, GPS location) via PWA or SMS.
2. C++ backend executes a spatial PostGIS query to compute distance vectors between the farm location and nearby mandis.
3. Engine validates available daily quota slots in Redis and returns an HMAC-signed cryptographic QR pass + alphanumeric token.

#### Phase 2: Gate Arrival & Authentication
1. Upon vehicle arrival at the mandi, the long-range UHF RFID gate scanner reads the cart tag (or QR scanner validates the mobile pass).
2. ESP32 edge MCU publishes verification telemetry to `mandi/gate/verify` via MQTT.
3. C++ backend authenticates the signature and signals the servo barrier arm to open.

#### Phase 3: Automated Weighing & Ingestion
1. Vehicle proceeds onto the digital weighbridge scale platform.
2. Industrial load cell sensors log gross weight (Vehicle + Grain Payload).
3. The HX711 ADC module digitizes scale readings; ESP32 transmits data payload to `mandi/weighbridge/data`.
4. Backend writes gross weight logs directly to PostgreSQL.

#### Phase 4: Tare Deduction & Official Record Logging
1. Following grain unloading, the empty vehicle passes over the secondary weighbridge to record tare weight.
2. System calculates `Net Weight = Gross Weight - Tare Weight`.
3. System generates an unalterable transaction ledger entry, fires an SMS receipt to the farmer, and queues weight metrics to government MSP payment APIs.

---

## 4. System Requirements Specification

### 4.1 Functional Requirements (FR)

* **FR-1: Dynamic Slot Allocation & Load Balancing**
  * **FR-1.1:** System shall ingest booking parameters including farmer credentials, harvest volume, crop type, and geolocation.
  * **FR-1.2:** System shall assign optimal time slots based on real-time mandi processing throughput to prevent gate congestion.
  * **FR-1.3:** System shall execute emergency queue re-prioritization for perishable crops upon detection of adverse weather warnings.

* **FR-2: Multi-Channel Real-Time Status Tracking**
  * **FR-2.1:** System shall issue SHA-256 HMAC-signed tokens and dynamic QR codes for every confirmed reservation slot.
  * **FR-2.2:** System shall push live queue status updates (e.g., *"3 carts ahead of your slot"*) directly to farmer endpoints.
  * **FR-2.3:** System shall provide localized multi-lingual SMS and IVRS audio support for feature-phone users.

* **FR-3: Mandi Hardware & Scale Automation**
  * **FR-3.1:** System shall authenticate incoming vehicles automatically using long-range UHF RFID tag readers at mandi entry gates.
  * **FR-3.2:** System shall capture scale load cell signals via MQTT, recording verified net weight directly into central databases without manual intervention.

---

### 4.2 Non-Functional Requirements (NFR)

* **NFR-1: Throughput & Execution Latency**  
  Core allocation engine must sustain `10,000+` transactions per second (TPS) with processing execution time under `5ms` during peak morning booking windows (06:00 AM – 08:00 AM).

* **NFR-2: Low Bandwidth Optimization**  
  Mobile API response payloads must not exceed `50 KB` per request to ensure reliable execution over 2G/3G rural cellular networks.

* **NFR-3: Availability & Local Fault Tolerance**  
  System shall guarantee **99.95% operational uptime** during harvest months. Mandi edge controllers must store up to 1,000 gate logs locally in non-volatile flash memory during network outages, auto-syncing upon re-connection.

* **NFR-4: Data Security & Anti-Fraud Governance**  
  Digital pass signatures must be verified via HMAC SHA-256 to prevent ticket forgery. Weighbridge sensor logs must be read-only and immutable post-transaction.

---

## 5. Expected Technical & Social Outcomes

* ⏱️ **Wait Time Reduction:** Minimizes average farmer queue duration from **36 hours down to under 45 minutes**.
* ⚖️ **Elimination of Manual Weight Fraud:** Direct hardware telemetry ensures 100% accurate weight accounting with zero manual tally edits.
* 🚦 **Regional Traffic Redistribution:** Automatically distributes traffic to underutilized nearby mandis, preventing regional highway gridlock.
