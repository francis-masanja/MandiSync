/*
  Warnings:

  - Added the required column `activeQueueCount` to the `mandis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allocatedTodayKg` to the `mandis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgWaitMinutes` to the `mandis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `mandis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `mandis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxDailyKg` to the `mandis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mandis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "maxDailyKg" INTEGER NOT NULL,
    "allocatedTodayKg" INTEGER NOT NULL,
    "activeQueueCount" INTEGER NOT NULL,
    "avgWaitMinutes" INTEGER NOT NULL
);
INSERT INTO "new_mandis" ("id", "location", "name") SELECT "id", "location", "name" FROM "mandis";
DROP TABLE "mandis";
ALTER TABLE "new_mandis" RENAME TO "mandis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
