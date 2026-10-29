import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mudbrew.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      duration_mins INTEGER NOT NULL,
      max_participants INTEGER NOT NULL,
      available_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
      time_slots TEXT NOT NULL DEFAULT '["11:30","15:00","18:30"]',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocked_dates_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time_slot TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('table', 'experience')),
      experience_id INTEGER,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
      staff_notes TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(date, time_slot, status);
    CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);
    CREATE INDEX IF NOT EXISTS idx_bookings_mobile ON bookings(mobile);
  `);
}

export default db;

