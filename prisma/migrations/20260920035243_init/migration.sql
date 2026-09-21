/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mandi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Slot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Telemetry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Booking";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Mandi";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Slot";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Task";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Telemetry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'farmer'
);

-- CreateTable
CREATE TABLE "mandis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mandi_id" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "slots_mandi_id_fkey" FOREIGN KEY ("mandi_id") REFERENCES "mandis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmer_id" TEXT NOT NULL,
    "farmer_name" TEXT NOT NULL,
    "farmer_phone" TEXT NOT NULL,
    "farmer_village" TEXT NOT NULL,
    "farmer_lat" REAL NOT NULL,
    "farmer_lon" REAL NOT NULL,
    "mandi_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "crop_type" TEXT NOT NULL,
    "crop_variety" TEXT NOT NULL,
    "estimated_kg" INTEGER NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "rfid_tag" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    "actual_gross_kg" REAL,
    "actual_tare_kg" REAL,
    "actual_net_kg" REAL,
    "gate_entry_at" DATETIME,
    "gross_weighed_at" DATETIME,
    "tare_weighed_at" DATETIME,
    "rate_per_quintal" INTEGER,
    "total_payout_inr" INTEGER,
    "hmac_token" TEXT,
    CONSTRAINT "bookings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_mandi_id_fkey" FOREIGN KEY ("mandi_id") REFERENCES "mandis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "telemetry_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "rfid_tag" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GROSS',
    "weight_kg" REAL NOT NULL,
    "moisture_pct" REAL,
    "device_id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "telemetry_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "assignee_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "due_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slot_id_key" ON "bookings"("slot_id");
