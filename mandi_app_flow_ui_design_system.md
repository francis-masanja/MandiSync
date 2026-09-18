# Smart Mandi Agricultural Queue & Telemetry App
## System Architecture, Full User Flow, and Design System Guide

---

## Part 1: Complete Root-to-Leaf App User Flow Architecture

This visual flow tree details how a user enters the app from the root route (`/`) and navigates through authentication, role branching, slot booking, gate verification, weighbridge telemetry, and final digital receipt generation.

```
                                [ / ] (App Root Launch)
                                          │
                                  (Auth Check)
                                 ┌────────┴────────┐
                                 ▼                 ▼
                          [ Authenticated ]   [ Unauthenticated ]
                                 │                 │
                                 │                 ▼
                                 │        [ /auth/login ] ─────────────┐
                                 │        - Phone Number + OTP         │
                                 │        - National ID / Credentials  │
                                 │                 │                   │
                                 │                 ▼                   │
                                 │        [ /auth/register ] ──────────┤
                                 │        - Profile Details            │
                                 │        - Role Selection:            │
                                 │          * Farmer                   │
                                 │          * Mandi Official / Gate    │
                                 │                 │                   │
                                 └─────────────────┼───────────────────┘
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                        [ ROLE: FARMER ]            [ ROLE: MANDI OFFICIAL ]
                                     │                           │
                                     ▼                           ▼
                         [ /farmer/dashboard ]       [ /official/dashboard ]
```

---

### Phase-by-Phase Screen Flow Breakdown

```
===================================================================================
                             BRANCH 1: FARMER USER FLOW
===================================================================================

[ /farmer/dashboard ] 
  ├── App fetches current GPS coordinates (Latitude, Longitude) via Capacitor.
  ├── Displays upcoming booked passes (if any) cached in IndexedDB.
  └── Button: [ Book New Arrival Slot ]
        │
        ▼
[ /farmer/select-mandi ]
  ├── App executes Haversine trigonometric distance query against Turso DB.
  ├── Displays nearby Mandi procurement centers sorted by proximity (km).
  ├── Displays real-time daily quota bars (e.g., "6,200 kg / 10,000 kg Remaining").
  └── Action: Farmer taps a Mandi card to select.
        │
        ▼
[ /farmer/book-slot ]
  ├── Select Crop Type (e.g., Wheat, Maize, Rice).
  ├── Enter Estimated Weight in Kilograms (e.g., 2,500 kg).
  ├── Select Available 1-Hour Time Window (e.g., 08:00 AM - 09:00 AM).
  └── Action: Tap [ Confirm Slot Reservation ].
        │
        ▼ (Calls Serverless API: /api/v1/bookings/create via db.batch() transaction)
        │
[ /farmer/pass-issued ]
  ├── Generates SHA-256 HMAC Cryptographic Pass Signature.
  ├── Displays dynamic QR Code & Booking Token ID.
  ├── Offline Sync: Writes payload to IndexedDB for offline gate display.
  └── Action: Tap [ View Live Queue Status ].
        │
        ▼
[ /farmer/live-queue ]
  ├── Displays current queue position and estimated arrival countdown (< 45 mins).
  ├── Gate Scan Action (Automated at physical Mandi):
  │     ├── ESP32 hardware scans RFID on tractor OR Gate Guard scans QR Code.
  │     └── Server validates pass and opens physical gate barrier.
  └── Navigation: Redirects to [/farmer/telemetry-status] once admitted.
        │
        ▼
[ /farmer/receipt ] (Post Weighbridge Telemetry)
  ├── Displays automated scale records captured directly from ESP32 HX711 scale:
  │     ├── Gross Weight ($W_{\text{gross}}$)
  │     ├── Tare Weight ($W_{\text{tare}}$)
  │     └── Net Delivered Yield ($W_{\text{net}} = W_{\text{gross}} - W_{\text{tare}}$)
  ├── Digital Certificate Download (PDF / Image pass).
  └── Action: Return to [/farmer/dashboard].


===================================================================================
                         BRANCH 2: MANDI OFFICIAL / GATE FLOW
===================================================================================

[ /official/dashboard ]
  ├── Overview of current mandi arrival density and remaining daily capacity.
  └── Quick Actions: [ Gate QR Scanner ] | [ Manual Scale Override ]
        │
        ▼
[ /official/scan-pass ]
  ├── Uses native camera via Capacitor plugin to scan farmer's SHA-256 QR code.
  ├── Validates token against `/api/v1/telemetry/gate-verify`.
  └── Triggers hardware barrier release command (`{"gate_open": true}`).
        │
        ▼
[ /official/scale-monitor ]
  ├── Receives live weighbridge telemetry feeds directly from ESP32 HTTP endpoints.
  ├── Monitors gross vs tare weighbridge readings in real time.
  └── Submits final transaction ledger confirmation to Turso DB.
```

---

## Part 2: Design System (Color System & Typography System)

To ensure the app looks modern, accessible under bright outdoor sunlight, and builds high trust with agricultural producers, we define a specialized UI token system built on top of Tailwind CSS.

### 1. Color System Palette

```
   [ Emerald Green ]      [ Harvest Amber ]       [ Slate Neutral ]       [ Status Tokens ]
  Primary Trust Brand     Accent & Dynamic Slots    Backgrounds & Text    Success, Warning, Danger
  -------------------     ---------------------    ------------------    ------------------------
  50  : #ecfdf5           50  : #fffbeb            50  : #f8fafc         Success: #16a34a
  500 : #10b981           500 : #f59e0b            100 : #f1f5f9         Warning: #ea580c
  700 : #047857           600 : #d97706            800 : #1e293b         Danger : #dc2626
  900 : #064e3b           700 : #b45309            900 : #0f172a         Info   : #2563eb
```

#### Color Mapping & Utility Specification

| Role / Element | Color Name | Hex Code | Tailwind Token | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Brand** | Emerald Green | `#047857` | `bg-emerald-700` | Primary action buttons, active navigation, headers. |
| **Primary Hover** | Deep Emerald | `#064e3b` | `hover:bg-emerald-900` | Hover states for primary buttons. |
| **Accent / Action** | Harvest Amber | `#d97706` | `bg-amber-600` | Slot reservation tags, queue highlight badges, key CTAs. |
| **Background Light** | Off-White Slate | `#f8fafc` | `bg-slate-50` | Default app mobile screen background. |
| **Card Surface** | Pure White | `#ffffff` | `bg-white` | Elevated UI cards, form containers, pass wrappers. |
| **Primary Text** | Dark Slate | `#0f172a` | `text-slate-900` | High-contrast body text (readable outdoors in sunlight). |
| **Secondary Text** | Slate Gray | `#64748b` | `text-slate-500` | Subtitles, labels, secondary metadata. |
| **Success State** | Gate Open Green | `#16a34a` | `text-green-600` | Validated pass, gate open indicator, weighbridge success. |
| **Alert / Warning** | Capacity Limit Amber | `#ea580c` | `text-orange-600` | Slots filling up fast, low remaining quota. |
| **Danger State** | Invalid Token Red | `#dc2626` | `text-red-600` | Expired pass, invalid RFID, gate locked alert. |

---

### 2. Typography Hierarchy System

The system uses **Plus Jakarta Sans** or **Inter** as its primary typeface—chosen specifically for extreme clarity on mid-range and budget mobile smartphone screens.

```
  DISPLAY   : 32px / Bold (700)      --> Hero headlines, Pass verification badges
  HEADING 1 : 24px / SemiBold (600)  --> Screen titles, Mandi card titles
  HEADING 2 : 18px / SemiBold (600)  --> Section titles, Scale weight numbers ($W_{net}$)
  BODY MAIN : 15px / Regular (400)   --> Form fields, body text, instructions
  CAPTION   : 12px / Medium (500)    --> Timestamps, RFID tags, secondary metadata
```

#### Typography Scale Table

| Level | Size (px) | Line Height | Font Weight | Tailwind CSS Classes | Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Header** | `32px` | `1.2` | Bold (`700`) | `text-3xl font-bold tracking-tight` | Live scale weight digits, QR Pass headers. |
| **Header 1** | `24px` | `1.3` | SemiBold (`600`) | `text-2xl font-semibold` | Page titles (e.g., "Select Procurement Center"). |
| **Header 2** | `18px` | `1.4` | SemiBold (`600`) | `text-lg font-semibold` | Card headers, Mandi names, slot titles. |
| **Body Large** | `16px` | `1.5` | Regular (`400`) | `text-base font-normal` | Main input form text, button text. |
| **Body Regular** | `14px` | `1.5` | Regular (`400`) | `text-sm font-normal` | Standard descriptive text, table data. |
| **Caption / Badge** | `12px` | `1.4` | Medium (`500`) | `text-xs font-medium uppercase` | Status badges ("BOOKED", "GATE OPEN"), RFID tags. |

---

## Part 3: Master AI Refinement System Prompt

You can copy and paste the prompt below directly into AI code generators (like ChatGPT, Claude, V0, or Lovable) whenever you want to convert the logic into polished, high-quality UI components.

```text
===================================================================================
MASTER SYSTEM PROMPT FOR AI UI/UX GENERATION & COMPONENT REFINEMENT
===================================================================================

ROLE CONTEXT:
You are a Lead UI/UX Engineer and Senior Vue 3 Design System Specialist specializing in building modern, ultra-accessible Progressive Web Applications (PWAs) for agricultural logistics and hardware IoT integration.

TASK DIRECTIVE:
Refine and generate production-ready Vue 3 (Composition API) components using Tailwind CSS for the "Smart Agricultural Queue and Mandi Telemetry System". All UI must strictly follow the defined User Flow, Color Palette, and Typography guidelines.

DESIGN SYSTEM CONSTRAINTS & TOKENS:

1. COLOR SYSTEM (Tailwind CSS Tokens):
   - Primary Brand (Trust Emerald): `bg-emerald-700`, `text-emerald-700`, `border-emerald-700`, hover: `bg-emerald-800`
   - Accent / Slots (Harvest Amber): `bg-amber-600`, `text-amber-600`, `border-amber-600`
   - Backgrounds: App background `bg-slate-50`, Surface Cards `bg-white` with `shadow-sm border border-slate-200`
   - Primary Text: `text-slate-900` (High contrast outdoor sunlight readability)
   - Secondary Text: `text-slate-500`
   - Status Indicators:
     * Success / Gate Open: `bg-emerald-50 text-emerald-700 border-emerald-200`
     * Warning / Capacity Low: `bg-amber-50 text-amber-700 border-amber-200`
     * Danger / Invalid Token: `bg-red-50 text-red-700 border-red-200`

2. TYPOGRAPHY HIERARCHY:
   - Primary Font Family: Sans-serif (`Plus Jakarta Sans` or `Inter`)
   - Titles: `text-2xl font-semibold text-slate-900`
   - Section Headers: `text-lg font-semibold text-slate-800`
   - Weight Readings ($W_net$, $W_gross$): `text-3xl font-bold text-emerald-700`
   - Captions / Tokens: `text-xs font-medium uppercase tracking-wider text-slate-500`

3. USER INTERFACE REQUIREMENTS & DESIGN UX RULES:
   - Mobile-First Layout: Optimized for mobile screen widths (360px - 430px) with touch-friendly targets (minimum 48px height for all buttons and form controls).
   - Outdoor Sunlight Readability: High visual contrast between text and background elements. Avoid faint gray text.
   - Offline & Telemetry Visual Indicators: Display subtle status pills showing network state (`Online` / `Offline - Saved to Local Device`).
   - Component Cleanliness: Use lucide-vue-next icons for clean, modern visual cues.

REQUIRED OUTPUT COMPONENT SPECIFICATION:
Generate clean, fully functioning Vue 3 `<script setup lang="ts">` components with responsive Tailwind CSS classes. Ensure state management handles loading indicators, dynamic inputs, and clear empty/error states.
===================================================================================
```