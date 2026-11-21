"""Content source for the MandiSync CA2 report and the five HTML guides.

All prose is kept here so the DOCX, PDF and HTML pages stay consistent.
The humanizer script writes a parallel JSON file keyed by the same section
names; the report builder prefers that file when it exists.
"""

META = {
    "title": "MandiSync: An IoT-Enabled Mandi Queue and Weighbridge Management System",
    "short_title": "MandiSync",
    "university": "Lovely Professional University, Punjab",
    "semester": "Aug - Dec 2026",
    "supervisor": "Dr. Gaurav Kumar",
    "course": "CA2 Project Report",
    "members": [
        {
            "name": "Francis Masanja",
            "reg": "12529273",
            "area": "Hardware Integration",
            "segment": "How We Planned It",
        },
        {
            "name": "Minza Aron",
            "reg": "12529800",
            "area": "Frontend",
            "segment": "What Users See",
        },
        {
            "name": "Amro",
            "reg": "12530529",
            "area": "Middleware and Security",
            "segment": "The Big Picture",
        },
        {
            "name": "Omer",
            "reg": "12530473",
            "area": "Backend",
            "segment": "How It Works",
        },
        {
            "name": "Vikie",
            "reg": "12524596",
            "area": "Database",
            "segment": "Data, Team and Next Steps",
        },
    ],
}

TIMELINE = [
    # no, task, planned start, planned end, actual, status
    ("1", "Requirement Analysis", "18 Aug 2026", "24 Aug 2026", "24 Aug 2026", "Completed"),
    ("2", "Literature Review / Existing System Study", "25 Aug 2026", "05 Sep 2026", "05 Sep 2026", "Completed"),
    ("3", "System Design and Planning", "06 Sep 2026", "11 Sep 2026", "11 Sep 2026, 17:20", "Completed"),
    ("4", "UI/UX Design and Wireframes", "08 Sep 2026", "14 Sep 2026", "14 Sep 2026, 11:40", "Completed"),
    ("5", "Database Design", "13 Sep 2026", "17 Sep 2026", "18 Sep 2026, 10:58", "Completed"),
    ("6", "Frontend Development", "18 Sep 2026", "23 Sep 2026", "18 Sep 2026, 13:57", "Completed"),
    ("7", "Backend Development", "18 Sep 2026", "28 Sep 2026", "21 Sep 2026, 07:55", "Completed"),
    ("8", "System Integration", "22 Sep 2026", "15 Oct 2026", "29 Oct 2026, 12:32", "Completed (prototype)"),
    ("9", "Testing and Debugging", "20 Oct 2026", "28 Oct 2026", "29 Oct 2026, 15:10", "Partial"),
    ("10", "Documentation and Final Submission", "29 Oct 2026", "05 Nov 2026", "02 Nov 2026, 16:25", "In Progress"),
]

WEEK_SCHEDULE = [
    ("Week 1", "Requirement gathering and problem identification", "Requirements document", "Completed"),
    ("Week 2", "System analysis and technology selection", "System specification", "Completed"),
    ("Week 3", "Architecture and UI/UX design", "Architecture diagram and wireframes", "Completed"),
    ("Week 4", "Database modelling and implementation planning", "ER diagram and database schema", "Completed"),
    ("Week 5", "Frontend development", "Initial user interface", "Completed"),
    ("Week 6", "Backend development", "Core backend functionality", "Completed"),
    ("Week 7", "Integration of frontend, backend and database", "Integrated application", "Completed (prototype)"),
    ("Week 8", "Testing, debugging, documentation and final review", "Tested application and final report", "In Progress"),
]

TECH_STACK = [
    (
        "Frontend",
        "Next.js 16 (App Router), React 19, TypeScript 5.9, Tailwind CSS 4",
        "Builds the farmer, gate, weighbridge and queue screens in one responsive web application.",
        "One codebase for server and client code, file-based routing, strong TypeScript support and fast iteration.",
    ),
    (
        "Backend",
        "Next.js Route Handlers, NextAuth 4, Zod",
        "Provides the REST API, session handling and payload validation.",
        "Keeps the API next to the UI, avoids a second deployment and supports serverless hosting.",
    ),
    (
        "Database",
        "SQLite for local development, Turso/libSQL for hosted data, Prisma 7 with the libSQL adapter",
        "Stores users, mandis, slots, bookings, telemetry and tasks.",
        "Prisma gives a readable schema and migrations; SQLite is easy to run locally; Turso can host a libSQL database.",
    ),
    (
        "Programming Language",
        "TypeScript and JavaScript for the web app; C++ for the ESP32 nodes",
        "Implements the web application and the device firmware.",
        "TypeScript catches interface mistakes early; C++ is required by the Arduino/ESP32 toolchain.",
    ),
    (
        "Development Environment / IDE",
        "Visual Studio Code with ESLint and Prisma extensions",
        "Writing, linting and debugging the project.",
        "Good TypeScript support, integrated terminal and a useful Prisma schema extension.",
    ),
    (
        "Version Control",
        "Git and GitHub",
        "Tracks changes, supports branches and keeps a recoverable project history.",
        "The commit history also helped us reconstruct the real project timeline for this report.",
    ),
    (
        "Testing Tools",
        "ESLint, TypeScript compiler and manual smoke tests now; Vitest and Playwright planned",
        "Checks code style, types and the main user flows.",
        "Lint and type-check are already used; the automated unit and end-to-end suites are the next quality step.",
    ),
    (
        "Deployment / Hosting Platform",
        "Vercel target; local Node.js server for the demo",
        "Hosts the Next.js application and API routes.",
        "Vercel supports Next.js directly; local Node keeps the classroom demo simple.",
    ),
    (
        "Other Libraries and APIs",
        "Lucide React, Motion, QRCode, bcryptjs, Zod, optional Ollama client",
        "Icons, animation, QR gate passes, password hashing, validation and an optional AI advisor.",
        "Each library covers a small, well-defined need without pulling in a second framework.",
    ),
]

MODULES = [
    (
        "Farmer Portal",
        "A guided booking flow that lets a farmer choose a mandi, crop, estimated weight and arrival window, then shows the booking status and gate pass.",
        "Farmer details, mandi, slot, crop, weight, vehicle number and RFID tag",
        "Booking record and a signed gate pass",
    ),
    (
        "Gate Control Desk",
        "Checks an RFID tag or gate pass, updates the booking status and tells the barrier whether to open.",
        "RFID tag or pass payload",
        "Gate-open decision, barrier pulse and booking status",
    ),
    (
        "Weighbridge Bench",
        "Records gross and tare readings from the scale node, calculates net weight and stores the telemetry.",
        "Weight, measurement type, moisture and device ID",
        "Net weight, payout fields and a telemetry log",
    ),
    (
        "Queue Ledger",
        "Shows waiting, gate-verified, weighing and completed vehicles, plus total procured weight.",
        "Optional mandi filter",
        "Booking list, queue counts and daily metrics",
    ),
    (
        "Auth and Admin",
        "Handles login, sessions, role checks and protected routes.",
        "Email and password",
        "Session token and a role-based view",
    ),
    (
        "Hardware Ingestion",
        "Receives gate and scale telemetry, including offline batches from LittleFS.",
        "Signed JSON packets from ESP32 nodes",
        "Stored telemetry, updated bookings and a sync result",
    ),
]

SECTIONS = {
    "intro": [
        "MandiSync is a web-based platform for agricultural mandis, the regulated markets where farmers bring produce to be weighed and sold. It brings slot booking, gate entry, weighbridge recording and queue tracking into one system. Farmers can see nearby mandis, check how much capacity is left and reserve an arrival window instead of travelling and joining an unknown queue. Mandi staff get a gate desk that checks an RFID tag or QR pass, a weighbridge screen that records gross and tare weights, and a live ledger that shows how many vehicles are waiting and how many have finished.",
        "The project combines a Next.js web application with a Prisma and SQLite database and a separate ESP32 hardware folder for the gate and scale nodes. The web app is the main interface. The device code is kept outside the website and talks to the server through API endpoints. We built the system as a working prototype: the main screens and API routes are in place, and the next stage is hardening the data layer, adding device authentication and writing automated tests.",
    ],
    "problem": [
        "In many mandis, arrival is still managed through physical queues, paper slips and phone calls. A farmer may travel a long distance without knowing whether the mandi has capacity or how long the wait will be. Gate staff check entries by hand, weighbridge readings are copied into registers, and the same booking can be written in more than one place. This creates long queues, avoidable trips, typing mistakes and weak records for settlement. There is also no shared live view: the farmer, gate operator and mandi manager each work from different information.",
        "MandiSync addresses this by giving all three roles one source of truth for bookings, gate status and weights. Device readings are captured through a controlled API instead of being copied by hand, and the queue ledger is built from the same booking records. The result is a clearer flow from booking to gate to weighing, with less repeated data entry and a visible status at each stage.",
    ],
    "objectives": [
        "Provide a simple farmer portal for checking nearby mandis and booking an arrival slot.",
        "Verify gate entry using an RFID tag or QR pass and update the booking status.",
        "Capture gross and tare weights from an ESP32 and HX711 scale and calculate net weight.",
        "Show a live queue ledger with waiting, gate-verified, weighing and completed vehicles.",
        "Build a modular foundation that can be hardened for real deployment with a durable database, device authentication and automated tests.",
    ],
    "scope": [
        "The prototype covers the farmer booking wizard, the mandi list with distance and quota information, gate verification, weighbridge entry, the queue ledger, a REST API, the Prisma data model and a hardware protocol with gate and scale sketches. It is meant to prove the end-to-end story and give the team a clear base for the next stage.",
        "It does not yet cover real payment settlement, government or e-NAM integration, SMS or OTP onboarding, production device provisioning, offline IndexedDB passes, PDF receipts or a complete automated test suite. Those items are listed in the future-work section instead of being presented as finished features.",
    ],
    "tech_justification": [
        "We chose Next.js because it lets us keep the user interface and the API in one TypeScript project. The App Router gives us server components for the first data load and route handlers for the REST endpoints, so the team did not have to maintain a separate backend service during a short project. React and Tailwind made it possible to build the multi-role screens quickly, and TypeScript caught several shape mistakes before runtime.",
        "Prisma was chosen because the schema is readable and the migrations are easy to review. SQLite keeps local development simple, while the libSQL adapter gives the project a path to Turso if it is hosted. NextAuth, bcrypt and Zod cover the basic security and validation needs without extra infrastructure. The trade-off is that the current in-memory fallback was useful for the demo but must be removed before production, because data disappears when the process restarts.",
    ],
    "architecture": [
        "The browser loads React pages from the Next.js application. Server components read data through the shared data layer, and client components call the /api/v1 endpoints. Middleware checks the NextAuth session and the role before protected pages and API routes are allowed. The data layer uses Prisma when the database URL is configured; otherwise it falls back to an in-memory seed for the classroom demo.",
        "The gate node and the scale node sit outside the website. The gate node sends an RFID tag to the gate-verify endpoint and expects a gate-open decision and a barrier pulse. The scale node sends gross and tare readings to the weighbridge endpoint. The hardware protocol uses HMAC headers, and the server-side verification of those headers is the next hardware milestone. If the network drops, the scale node can buffer packets in LittleFS and send them later through the batch-sync endpoint. An optional Ollama client can generate booking advice, but it is not part of the main booking or weighing flow.",
    ],
    "workflow": [
        "A farmer logs in and opens the farmer portal. The portal lists mandis with distance and remaining capacity. The farmer selects a mandi, crop, estimated weight and a one-hour arrival window, then submits the booking. The server validates the input, creates a booking record and returns a gate pass token. When the vehicle reaches the mandi, the gate desk scans the RFID tag or QR pass. The gate-verify endpoint looks up the booking, checks that it is still valid, changes the status to GATE_VERIFIED and returns a gate-open decision.",
        "The vehicle then moves to the weighbridge. The scale node sends the gross weight, and later the tare weight, to the weighbridge endpoint. The server stores both readings, calculates net weight, updates the payout fields where a rate is available and writes a telemetry log. The queue ledger reads the same booking records and shows how many vehicles are waiting, how many have passed the gate, how many are being weighed and how many are complete. If a device was offline, its buffered packets are sent through batch-sync and processed in the same way.",
    ],
    "ui_overview": [
        "The interface uses a glassy-clay style: soft translucent cards, rounded corners, a light background and a strong emerald primary colour. Emerald is used for primary actions and successful checks, amber for waiting or capacity warnings, red for errors and slate for body text. The farmer flow is a step-by-step wizard so the user never has to understand the whole system at once. The gate and weighbridge screens use large controls because they are meant for a desk or a busy outdoor counter.",
        "The layout is responsive and uses a small set of repeated cards, tables and badges. Labels are written in plain language, and status colours are paired with text so the meaning does not depend on colour alone. The current build still has a login wall and a few routes that are only placeholders; the target design moves the landing page into public view and turns the remaining placeholder screens into real pages.",
    ],
    "usability": [
        "We kept navigation consistent by using the same header, card style and button treatment on every screen. Important actions are placed at the bottom of the form flow, and destructive or irreversible actions are kept away from the main path. Form fields show clear labels and validation messages, and the booking wizard keeps the farmer's earlier choices visible.",
        "For readability, we used high-contrast text, short headings and a limited colour palette. Touch targets are large enough for a phone or a counter tablet, and tables collapse into cards on narrow screens where possible. Accessibility is not fully audited yet, but the design avoids colour-only status cues, keeps focus styles visible and uses semantic buttons and labels. The main usability gap is the missing public landing page and the fact that some operator routes redirect to pages that do not exist yet.",
    ],
    "db_overview": [
        "The project uses a relational model. SQLite is the local database, and the same schema can run on Turso through the libSQL adapter. Prisma is the single access layer: the schema defines the tables, the migrations create them and the generated client gives the application typed queries. The current runtime can also fall back to an in-memory seed when the database URL is missing, which is useful for a quick demo but not acceptable for production.",
        "The main entities are User, Mandi, Slot, Booking, Telemetry and Task. A user can make many bookings, a mandi has many slots and many bookings, a slot belongs to one booking, and a booking has many telemetry readings. Tasks connect a user and optionally a booking to follow-up work. This structure keeps the queue, gate and weighbridge views on the same records instead of separate spreadsheets.",
    ],
    "data_management": [
        "New bookings are inserted through the booking service, and status changes are applied through the gate and weighbridge services. Reads are typed Prisma queries, and the queue view aggregates counts from the same booking table. The schema uses a unique email for users and a unique slot per booking, which prevents two bookings from claiming the same slot.",
        "Zod validates telemetry payloads and query parameters, while the booking route performs explicit checks for required fields and coordinate ranges. Sensitive values such as password hashes and API secrets are kept server-side, and passwords are stored with bcrypt rather than plain text. The remaining data risks are the in-memory fallback, the JSON-file user store and the lack of server-side device signature verification; these are called out in the limitations.",
    ],
    "conclusion": [
        "MandiSync now has a working prototype of the full mandi flow. A farmer can book a slot, the gate desk can verify an arrival, the weighbridge can record gross and tare weights, and the queue ledger can show the current state. The project also produced a real Prisma data model, a REST API, a design system and a separate hardware tree with gate and scale sketches. The team can demonstrate the idea end to end and explain how each part is meant to work.",
        "The project does not yet meet production standards. Automated tests, a durable default database, database-backed users, device HMAC verification and a real deployment pipeline are still open. Those gaps are known and documented, which is why the report describes MandiSync as a strong prototype rather than a finished commercial system. The foundation is clear enough for the next stage to focus on hardening instead of redesign.",
    ],
    "limitations": [
        "The default runtime falls back to an in-memory database when DATABASE_URL is missing, so data is lost on restart.",
        "Users are still stored in data/users.json rather than the Prisma User table.",
        "Device requests are not yet verified with HMAC on the server, and the middleware currently blocks unauthenticated telemetry calls.",
        "There is no automated unit, integration or end-to-end test suite, and the CI test step is not yet backed by a real runner.",
        "The public landing page, working /demo route, password reset, offline IndexedDB passes and PDF receipts are incomplete.",
        "Debug and test API routes are still present in the build and must be removed or protected before any public deployment.",
    ],
    "future": [
        "Move users and sessions fully into the database and add signup, password reset and admin user management.",
        "Add device HMAC verification, a heartbeat endpoint and a device provisioning screen.",
        "Replace the in-memory fallback with a single, explicit database configuration and await every Prisma call.",
        "Add Vitest unit tests, Playwright end-to-end tests and a CI pipeline that runs lint, type-check, test and build.",
        "Add server-sent events or polling for the live queue and build the farmer and official route groups.",
        "Remove the hardware viewer from the website, keep device code in the hardware tree and add a real pilot checklist.",
    ],
}

REFERENCES = [
    "Next.js Documentation. https://nextjs.org/docs",
    "React Documentation. https://react.dev",
    "TypeScript Documentation. https://www.typescriptlang.org/docs",
    "Tailwind CSS Documentation. https://tailwindcss.com/docs",
    "Prisma Documentation. https://www.prisma.io/docs",
    "Turso and libSQL Documentation. https://docs.turso.tech",
    "NextAuth.js Documentation. https://next-auth.js.org",
    "Zod Documentation. https://zod.dev",
    "Espressif ESP32 Documentation. https://docs.espressif.com",
    "HX711 Arduino Library. https://github.com/bogde/HX711",
    "ArduinoJson Documentation. https://arduinojson.org",
    "Web Content Accessibility Guidelines (WCAG) 2.1. https://www.w3.org/WAI/WCAG21/quickref/",
    "Playwright Documentation. https://playwright.dev",
    "Vitest Documentation. https://vitest.dev",
]

DB_TABLES = [
    {
        "name": "User",
        "description": "Stores login identity and role.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique user identifier"),
            ("name", "String", "Required", "Display name"),
            ("email", "String", "Unique, required", "Login email"),
            ("password_hash", "String", "Required", "bcrypt password hash"),
            ("role", "String", "Default: farmer", "farmer, operator or admin"),
        ],
    },
    {
        "name": "Mandi",
        "description": "Stores market location and daily capacity.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique mandi identifier"),
            ("name", "String", "Required", "Mandi name"),
            ("location", "String", "Required", "Town or district"),
            ("latitude", "Float", "Required", "GPS latitude"),
            ("longitude", "Float", "Required", "GPS longitude"),
            ("maxDailyKg", "Integer", "Required", "Daily intake limit"),
            ("allocatedTodayKg", "Integer", "Required", "Capacity already booked"),
            ("activeQueueCount", "Integer", "Required", "Vehicles currently waiting"),
            ("avgWaitMinutes", "Integer", "Required", "Average wait estimate"),
        ],
    },
    {
        "name": "Slot",
        "description": "Stores one arrival window for a mandi.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique slot identifier"),
            ("mandiId", "String (UUID)", "Foreign key to Mandi", "Mandi that owns the slot"),
            ("startTime", "DateTime", "Required", "Window start"),
            ("endTime", "DateTime", "Required", "Window end"),
            ("isBooked", "Boolean", "Default: false", "Whether the slot is taken"),
        ],
    },
    {
        "name": "Booking",
        "description": "Stores the farmer's delivery request and its progress.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique booking identifier"),
            ("farmerId", "String (UUID)", "Foreign key to User", "Farmer who booked"),
            ("farmerName", "String", "Required", "Farmer name"),
            ("farmerPhone", "String", "Required", "Contact number"),
            ("farmerVillage", "String", "Required", "Village"),
            ("farmerLat", "Float", "Required", "Farmer latitude"),
            ("farmerLon", "Float", "Required", "Farmer longitude"),
            ("mandiId", "String (UUID)", "Foreign key to Mandi", "Selected mandi"),
            ("slotId", "String (UUID)", "Unique, foreign key to Slot", "Arrival window"),
            ("cropType", "String", "Required", "Crop name"),
            ("cropVariety", "String", "Required", "Crop variety"),
            ("estimatedKg", "Integer", "Required", "Estimated weight"),
            ("vehicleNumber", "String", "Required", "Vehicle registration"),
            ("rfidTag", "String", "Required", "RFID tag used at the gate"),
            ("status", "String", "Default: PENDING", "Booking lifecycle state"),
            ("createdAt", "DateTime", "Default: now", "Creation time"),
            ("completedAt", "DateTime?", "Nullable", "Completion time"),
            ("actualGrossKg", "Float?", "Nullable", "Gross weight"),
            ("actualTareKg", "Float?", "Nullable", "Tare weight"),
            ("actualNetKg", "Float?", "Nullable", "Net weight"),
            ("gateEntryAt", "DateTime?", "Nullable", "Gate verification time"),
            ("grossWeighedAt", "DateTime?", "Nullable", "Gross weigh time"),
            ("tareWeighedAt", "DateTime?", "Nullable", "Tare weigh time"),
            ("ratePerQuintal", "Integer?", "Nullable", "Rate per quintal"),
            ("totalPayoutInr", "Integer?", "Nullable", "Calculated payout"),
            ("hmacToken", "String?", "Nullable", "Signed gate pass token"),
        ],
    },
    {
        "name": "Telemetry",
        "description": "Stores gate and weighbridge readings.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique log identifier"),
            ("bookingId", "String (UUID)", "Foreign key to Booking", "Related booking"),
            ("rfidTag", "String", "Required", "Tag that produced the reading"),
            ("type", "String", "Default: GROSS", "GROSS or TARE"),
            ("weightKg", "Float", "Required", "Measured weight"),
            ("moisturePct", "Float?", "Nullable", "Moisture percentage"),
            ("deviceId", "String", "Required", "Device that sent the reading"),
            ("source", "String", "Default: LIVE", "LIVE or LITTLEFS_BUFFER"),
            ("createdAt", "DateTime", "Default: now", "Reading time"),
        ],
    },
    {
        "name": "Task",
        "description": "Stores follow-up work for staff.",
        "fields": [
            ("id", "String (UUID)", "Primary key", "Unique task identifier"),
            ("description", "String", "Required", "Task description"),
            ("assigneeId", "String (UUID)", "Foreign key to User", "Assigned user"),
            ("bookingId", "String (UUID)?", "Nullable, foreign key to Booking", "Related booking"),
            ("dueAt", "DateTime?", "Nullable", "Due date"),
            ("createdAt", "DateTime", "Default: now", "Creation time"),
        ],
    },
]

RELATIONSHIPS = [
    ("User", "Booking", "One-to-many", "One farmer can create many bookings."),
    ("Mandi", "Slot", "One-to-many", "One mandi has many arrival windows."),
    ("Mandi", "Booking", "One-to-many", "One mandi receives many bookings."),
    ("Slot", "Booking", "One-to-one", "A slot can be booked only once; Booking.slotId is unique."),
    ("Booking", "Telemetry", "One-to-many", "A booking can have several gross/tare readings."),
    ("User", "Task", "One-to-many", "A staff user can be assigned many tasks."),
    ("Booking", "Task", "One-to-many", "A booking can have follow-up tasks."),
]

CONTRIB_MATRIX = [
    ("Requirement Analysis", "Contributed", "Contributed", "Led", "Contributed", "Contributed"),
    ("Project Planning", "Contributed", "Contributed", "Contributed", "Led", "Contributed"),
    ("UI/UX Design", "Reviewed", "Led", "Contributed", "Reviewed", "Reviewed"),
    ("Frontend Development", "Reviewed", "Led", "Reviewed", "Contributed", "Reviewed"),
    ("Backend Development", "Reviewed", "Contributed", "Reviewed", "Led", "Contributed"),
    ("Database Design", "Reviewed", "Reviewed", "Contributed", "Contributed", "Led"),
    ("Testing and Debugging", "Contributed", "Contributed", "Led", "Contributed", "Contributed"),
    ("Documentation", "Contributed", "Contributed", "Contributed", "Contributed", "Led"),
    ("Integration and Deployment", "Led", "Contributed", "Contributed", "Contributed", "Contributed"),
]

DETAILED = {
    "Francis Masanja": {
        "responsibilities": "Hardware integration, device protocol, gate and scale node design, offline buffering and deployment notes.",
        "work": "Created the hardware folder structure, wrote the gate and scale sketches, defined the HMAC request format, documented LittleFS buffering and prepared the wiring and deployment guides. Also coordinated the project timeline and the overall integration.",
        "evidence": "hardware/README.md, hardware/PROTOCOL.md, hardware/DEPLOYMENT.md, hardware/gate-node/, hardware/scale-node/, hardware/shared/ and hardware/tools/.",
    },
    "Minza Aron": {
        "responsibilities": "Frontend development, UI/UX design, responsive layout and wireframes.",
        "work": "Built the React screens for the farmer, gate and queue views, applied the glassy-clay design tokens, prepared the wireframes and checked the layouts on narrow screens.",
        "evidence": "src/features/farmer/FarmerPortal.tsx, src/features/gate/GateControlDesk.tsx, src/features/queue/QueueLedger.tsx, src/app/(dashboard)/ and src/app/globals.css.",
    },
    "Amro": {
        "responsibilities": "Middleware, authentication, role-based access, security headers and rate limiting.",
        "work": "Implemented the NextAuth route, the role and permission matrix, the middleware path map, CSP headers and the rate-limit helper. Reviewed the protected routes and documented the remaining device-auth gap.",
        "evidence": "src/proxy.ts, src/app/api/auth/[...nextauth]/route.ts, src/server/auth/roles.ts, src/server/rate-limit.ts and src/server/auth/users.ts.",
    },
    "Omer": {
        "responsibilities": "Backend API routes, booking and telemetry services, validation and data flow.",
        "work": "Implemented the v1 API routes for mandis, queue status, booking creation, gate verification, weighbridge readings and batch sync. Connected the routes to the data layer and added Zod validation for telemetry.",
        "evidence": "src/app/api/v1/, src/server/db.ts, src/shared/validation/telemetry.ts and src/shared/spatial.ts.",
    },
    "Vikie": {
        "responsibilities": "Database modelling, Prisma schema, migrations, seed data and data integrity.",
        "work": "Designed the relational model, wrote the Prisma schema and migrations, prepared the seed scripts and checked the relationships and constraints used by the API.",
        "evidence": "prisma/schema.prisma, prisma/migrations/, prisma/dev.db, scripts/seed-users.js and scripts/seed-turso.ts.",
    },
}

API_ENDPOINTS = [
    ("GET", "/api/v1/mandis", "List mandis with distance and slots"),
    ("GET", "/api/v1/queue/status", "Return bookings, telemetry and queue metrics"),
    ("POST", "/api/v1/bookings/create", "Create a booking and gate pass"),
    ("POST", "/api/v1/telemetry/gate-verify", "Verify an RFID tag at the gate"),
    ("POST", "/api/v1/telemetry/weighbridge", "Record a gross or tare weight"),
    ("POST", "/api/v1/telemetry/batch-sync", "Sync buffered device packets"),
    ("POST", "/api/v1/reset", "Reset demo data (admin only)"),
]

SAMPLE_TELEMETRY = """{
  "rfid_tag": "UHF-TAG-891024",
  "booking_id": "BK-2026-001",
  "weight_kg": 6450,
  "measurement_type": "GROSS",
  "moisture_percentage": 11.8,
  "device_id": "SCALE-01",
  "source": "LIVE_SENSOR_ADC"
}"""

TEST_NOTES = [
    "Lint and type-check were used as the first quality gate.",
    "The production build completed successfully on Next.js 16.",
    "Manual smoke tests covered login, the farmer booking wizard, gate verification and the queue view.",
    "Automated unit and end-to-end tests are planned and are not claimed as complete.",
]

SEGMENTS = [
    {
        "number": "01",
        "slug": "01-big-picture",
        "title": "The Big Picture",
        "owner": "Amro",
        "owner_area": "Middleware & Security",
        "one_minute": "MandiSync is one shared system for booking a mandi slot, checking the gate and recording weight. It replaces paper slips and phone calls with one live record.",
        "body": [
            "A farmer opens MandiSync, sees nearby mandis, checks the remaining capacity and books a one-hour arrival window. At the mandi, the gate desk scans the RFID tag or QR pass. The weighbridge records gross and tare weights, and the queue ledger updates for everyone.",
            "The project exists because mandis still depend on physical queues, handwritten registers and repeated phone calls. Farmers travel without knowing the wait, and staff copy the same details into more than one place. MandiSync keeps one record from booking to completion.",
        ],
        "key_terms": [
            ("Mandi", "A regulated agricultural market where farmers bring produce to be weighed and sold."),
            ("Slot", "A one-hour arrival window that a farmer books in advance."),
            ("Gate pass", "A signed token or QR code that proves a booking is valid at the gate."),
            ("Telemetry", "A reading sent by a device, such as an RFID scan or a scale weight."),
        ],
        "objectives": SECTIONS["objectives"],
        "takeaway": "The idea is simple: one booking record follows the farmer from the phone, to the gate, to the scale, to the final queue status.",
    },
    {
        "number": "02",
        "slug": "02-how-we-planned",
        "title": "How We Planned It",
        "owner": "Francis Masanja",
        "owner_area": "Hardware Integration",
        "one_minute": "We planned the work in phases, used the git history to check real progress and chose a small stack that the team could finish in one semester.",
        "body": [
            "The work started with requirement analysis and a study of how mandis currently handle arrivals. We then designed the screens, the database and the API before building the farmer, gate and queue views. The hardware tree was kept separate so the website never depends on a serial port.",
            "The timeline in the report uses the actual commit dates where they exist. The first commit was on 6 September 2026, the main UI and API rebuild landed on 18 September, security and validation followed on 21 September, and the final audit and bug fixes landed on 29 October. Documentation is still in progress.",
        ],
        "key_terms": [
            ("Next.js", "The web framework that provides both the pages and the API routes."),
            ("Prisma", "The database toolkit that turns the schema into typed queries."),
            ("Turso / libSQL", "A hosted SQLite-compatible database option."),
            ("ESP32", "A small Wi-Fi microcontroller used for the gate and scale nodes."),
        ],
        "objectives": [
            "Use a single TypeScript codebase for the UI and API.",
            "Keep local development simple with SQLite.",
            "Keep hardware code outside the website.",
            "Use git history to report real dates rather than invented ones.",
        ],
        "takeaway": "The plan was deliberately small: one web app, one data model and two device nodes. That kept the semester project achievable.",
    },
    {
        "number": "03",
        "slug": "03-how-it-works",
        "title": "How It Works",
        "owner": "Omer",
        "owner_area": "Backend",
        "one_minute": "The browser talks to Next.js, Next.js talks to Prisma, and the ESP32 nodes talk to the API. The gate and scale readings enter the same booking record.",
        "body": [
            "The browser loads React pages. Server components read through the shared data layer, and client components call the v1 API routes. Middleware checks the session and role before protected pages and API calls are allowed.",
            "The gate node sends an RFID tag to the gate-verify endpoint and gets back a gate-open decision. The scale node sends gross and tare weights to the weighbridge endpoint. The server stores the readings, calculates net weight, updates the booking and writes a telemetry log. The queue ledger reads the same booking table.",
        ],
        "key_terms": [
            ("Route handler", "A server function under app/api that handles an HTTP request."),
            ("Middleware", "Code that runs before a request reaches a page or route."),
            ("HMAC", "A keyed hash used to prove that a device request is genuine."),
            ("LittleFS", "A small file system on the ESP32 used to buffer readings when Wi-Fi is down."),
        ],
        "objectives": [
            "Show the architecture from browser to database.",
            "Explain the gate and scale telemetry path.",
            "Show how one booking record stays consistent across screens.",
            "Point out which parts are still prototype-level.",
        ],
        "takeaway": "The backend is the glue: it validates the request, updates one booking record and returns the result that the gate, scale and queue screens all share.",
    },
    {
        "number": "04",
        "slug": "04-what-users-see",
        "title": "What Users See",
        "owner": "Minza Aron",
        "owner_area": "Frontend",
        "one_minute": "The screens use soft glass cards, a green primary colour and a step-by-step booking flow. Gate and weighbridge screens use large controls for a busy counter.",
        "body": [
            "The farmer portal is a wizard: choose a mandi, choose a crop and weight, choose a time window and confirm. The gate desk shows the scanned tag, the booking and a clear open or denied state. The weighbridge screen shows the current weight and the gross and tare actions. The queue ledger shows the live list and the daily counts.",
            "The design uses emerald for primary actions and success, amber for waiting or capacity warnings, red for errors and slate for text. Status is always written as text as well as colour. The layout is responsive, and the main controls are large enough for a phone or a counter tablet.",
        ],
        "key_terms": [
            ("Glassy-clay", "A visual style with translucent cards, soft shadows and rounded corners."),
            ("Wizard", "A form split into steps so the user only sees one decision at a time."),
            ("Responsive", "A layout that adapts to phone, tablet and desktop widths."),
            ("Contrast", "The difference between text and background; higher contrast is easier to read."),
        ],
        "objectives": [
            "Make the farmer flow easy to follow without training.",
            "Make gate and weigh actions large and obvious.",
            "Keep status readable without relying on colour alone.",
            "Show both wireframes and real screenshots.",
        ],
        "takeaway": "The UI is designed for a noisy, busy mandi: big actions, plain labels and a clear next step.",
    },
    {
        "number": "05",
        "slug": "05-data-team-next-steps",
        "title": "Data, Team and Next Steps",
        "owner": "Vikie",
        "owner_area": "Database",
        "one_minute": "Six tables hold the whole story: users, mandis, slots, bookings, telemetry and tasks. The prototype works, but production hardening is still ahead.",
        "body": [
            "The database is relational. A user makes many bookings, a mandi has many slots and bookings, a slot belongs to one booking, and a booking has many telemetry readings. Tasks connect a user and sometimes a booking to follow-up work. Prisma defines the schema and migrations, and SQLite or Turso stores the data.",
            "The team split the work by technical area: hardware, frontend, middleware, backend and database. Each member also owns one report segment and one HTML study guide. The project is honest about what is left: automated tests, database-backed users, device HMAC verification, a public landing page and a real deployment pipeline.",
        ],
        "key_terms": [
            ("Primary key", "A column that uniquely identifies each row."),
            ("Foreign key", "A column that points to a row in another table."),
            ("Migration", "A versioned SQL change that updates the database schema."),
            ("HMAC verification", "The server checks that a device request was signed with the correct secret."),
        ],
        "objectives": [
            "Explain the six main tables and their relationships.",
            "Show how validation and access control protect the data.",
            "Make each member's contribution clear.",
            "Separate what is finished from what is still planned.",
        ],
        "takeaway": "The data model is the backbone of the project, and the team split makes it easy to see who owns which part.",
    },
]

HTML_CSS = """
:root {
  --bg: #f4f7f5;
  --card: rgba(255,255,255,.82);
  --ink: #0f172a;
  --muted: #5b6b7c;
  --emerald: #047857;
  --emerald-soft: #d1fae5;
  --amber: #b45309;
  --amber-soft: #fef3c7;
  --line: #dbe4e0;
  --shadow: 0 18px 45px rgba(6,78,59,.10);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(900px 500px at 10% -10%, #d1fae5 0%, transparent 60%),
    radial-gradient(700px 400px at 100% 0%, #fef3c7 0%, transparent 55%),
    var(--bg);
  line-height: 1.7;
}
.wrap { max-width: 980px; margin: 0 auto; padding: 28px 20px 80px; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; color: var(--emerald); }
.logo { width: 34px; height: 34px; border-radius: 11px; background: linear-gradient(135deg, #10b981, #047857); color: #fff; display: grid; place-items: center; font-size: 18px; }
.pill { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: var(--emerald-soft); color: var(--emerald); }
.hero { background: var(--card); border: 1px solid var(--line); border-radius: 26px; padding: 30px; box-shadow: var(--shadow); backdrop-filter: blur(14px); }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 800; color: var(--emerald); }
h1 { font-size: clamp(30px, 5vw, 48px); line-height: 1.1; margin: 10px 0 12px; letter-spacing: -.03em; }
h2 { font-size: 24px; margin: 34px 0 10px; letter-spacing: -.02em; }
h3 { font-size: 17px; margin: 22px 0 6px; }
p { margin: 10px 0; }
.lead { font-size: 18px; color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin-top: 18px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px; box-shadow: 0 8px 24px rgba(6,78,59,.06); }
.card b { color: var(--emerald); }
.note { border-left: 4px solid var(--emerald); background: var(--emerald-soft); padding: 14px 16px; border-radius: 12px; margin: 18px 0; }
.warn { border-left-color: var(--amber); background: var(--amber-soft); }
ul, ol { padding-left: 22px; }
li { margin: 7px 0; }
.terms { display: grid; gap: 10px; }
.term { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 12px 14px; background: #fff; border: 1px solid var(--line); border-radius: 12px; }
.term b { color: var(--emerald); }
table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px; background: #fff; border-radius: 12px; overflow: hidden; }
th { text-align: left; background: #ecfdf5; color: #065f46; padding: 10px; }
td { padding: 10px; border-top: 1px solid var(--line); vertical-align: top; }
figure { margin: 20px 0; }
figure img { width: 100%; border-radius: 14px; border: 1px solid var(--line); background: #fff; }
figcaption { font-size: 13px; color: var(--muted); margin-top: 6px; text-align: center; }
.footer { margin-top: 40px; color: var(--muted); font-size: 13px; text-align: center; }
.nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 0; }
.nav a { text-decoration: none; color: var(--emerald); background: #fff; border: 1px solid var(--line); padding: 8px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.nav a:hover { background: var(--emerald-soft); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 720px) { .two-col { grid-template-columns: 1fr; } .term { grid-template-columns: 1fr; } .hero { padding: 22px; } }
@media print { body { background: #fff; } .hero, .card { box-shadow: none; } .nav { display: none; } }
"""
