import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";

mkdirSync("data", { recursive: true });

const db = new Database("data/xeniia.db");

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "timeZone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "clientTimeZone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cancelledAt" DATETIME,
    CONSTRAINT "Booking_userId_fkey"
      FOREIGN KEY ("userId")
      REFERENCES "User" ("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "DaySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL UNIQUE,
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 120,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  DROP INDEX IF EXISTS "Booking_startsAt_endsAt_key";
  CREATE INDEX IF NOT EXISTS "Booking_startsAt_idx" ON "Booking" ("startsAt");
  CREATE INDEX IF NOT EXISTS "Booking_startsAt_endsAt_idx" ON "Booking" ("startsAt", "endsAt");
`);

const bookingColumns = db.prepare(`PRAGMA table_info("Booking")`).all().map((column) => column.name);

if (!bookingColumns.includes("updatedAt")) {
  db.exec(`ALTER TABLE "Booking" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'`);
}

if (!bookingColumns.includes("status")) {
  db.exec(`ALTER TABLE "Booking" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE'`);
}

if (!bookingColumns.includes("cancelledAt")) {
  db.exec(`ALTER TABLE "Booking" ADD COLUMN "cancelledAt" DATETIME`);
}

db.exec(`CREATE INDEX IF NOT EXISTS "Booking_status_startsAt_idx" ON "Booking" ("status", "startsAt")`);

db.close();
