import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { config } from "./config";
import { logger } from "./logger";

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure the data directory exists
    const dir = path.dirname(config.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(config.dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    logger.info("Database initialized", { path: config.dbPath });
  }
  return db;
}

function initSchema(): void {
  db.exec(`
    -- Contacts we track for re-engagement
    CREATE TABLE IF NOT EXISTS contacts (
      matrix_room_id   TEXT PRIMARY KEY,
      display_name     TEXT NOT NULL DEFAULT 'Unknown',
      matrix_user_id   TEXT,
      last_message_at  TEXT NOT NULL DEFAULT (datetime('now')),
      last_sender      TEXT,                -- 'self' | 'them'
      is_group         INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Message log for context building
    CREATE TABLE IF NOT EXISTS messages (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id          TEXT NOT NULL,
      sender_id        TEXT NOT NULL,
      body             TEXT NOT NULL,
      event_id         TEXT UNIQUE,
      timestamp        TEXT NOT NULL DEFAULT (datetime('now')),
      is_auto_reply    INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (room_id) REFERENCES contacts(matrix_room_id)
    );

    -- Auto-response decisions (audit log)
    CREATE TABLE IF NOT EXISTS response_log (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id          TEXT NOT NULL,
      incoming_body    TEXT NOT NULL,
      decision         TEXT NOT NULL,       -- 'responded' | 'skipped' | 'escalated'
      reason           TEXT,
      response_body    TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Re-engagement messages sent
    CREATE TABLE IF NOT EXISTS reengagement_log (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id          TEXT NOT NULL,
      message_body     TEXT NOT NULL,
      sent_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_messages_room_ts
      ON messages(room_id, timestamp DESC);

    CREATE INDEX IF NOT EXISTS idx_contacts_last_msg
      ON contacts(last_message_at);
  `);
}

// ── Contact operations ────────────────────────

export function upsertContact(
  roomId: string,
  displayName: string,
  matrixUserId: string | null,
  isGroup: boolean,
  lastSender: "self" | "them"
): void {
  getDb()
    .prepare(
      `INSERT INTO contacts (matrix_room_id, display_name, matrix_user_id, is_group, last_sender, last_message_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(matrix_room_id) DO UPDATE SET
         display_name   = excluded.display_name,
         matrix_user_id = COALESCE(excluded.matrix_user_id, contacts.matrix_user_id),
         last_sender    = excluded.last_sender,
         last_message_at = datetime('now')`
    )
    .run(roomId, displayName, matrixUserId, isGroup ? 1 : 0, lastSender);
}

export interface ContactRow {
  matrix_room_id: string;
  display_name: string;
  matrix_user_id: string | null;
  last_message_at: string;
  last_sender: string;
  is_group: number;
  created_at: string;
}

export function getStaleContacts(inactivityDays: number): ContactRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM contacts
       WHERE is_group = 0
         AND last_message_at < datetime('now', ? || ' days')
       ORDER BY last_message_at ASC`
    )
    .all(`-${inactivityDays}`) as ContactRow[];
}

export function getContact(roomId: string): ContactRow | undefined {
  return getDb()
    .prepare("SELECT * FROM contacts WHERE matrix_room_id = ?")
    .get(roomId) as ContactRow | undefined;
}

// ── Message operations ────────────────────────

export function insertMessage(
  roomId: string,
  senderId: string,
  body: string,
  eventId: string,
  isAutoReply: boolean = false
): void {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO messages (room_id, sender_id, body, event_id, is_auto_reply)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(roomId, senderId, body, eventId, isAutoReply ? 1 : 0);
}

export interface MessageRow {
  id: number;
  room_id: string;
  sender_id: string;
  body: string;
  event_id: string;
  timestamp: string;
  is_auto_reply: number;
}

export function getRecentMessages(roomId: string, limit: number): MessageRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM messages
       WHERE room_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`
    )
    .all(roomId, limit) as MessageRow[];
}

// ── Logging operations ────────────────────────

export function logResponse(
  roomId: string,
  incomingBody: string,
  decision: "responded" | "skipped" | "escalated",
  reason: string | null,
  responseBody: string | null
): void {
  getDb()
    .prepare(
      `INSERT INTO response_log (room_id, incoming_body, decision, reason, response_body)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(roomId, incomingBody, decision, reason, responseBody);
}

export function logReengagement(roomId: string, messageBody: string): void {
  getDb()
    .prepare(
      `INSERT INTO reengagement_log (room_id, message_body)
       VALUES (?, ?)`
    )
    .run(roomId, messageBody);
}

export function getLastReengagement(roomId: string): { sent_at: string } | undefined {
  return getDb()
    .prepare(
      `SELECT sent_at FROM reengagement_log
       WHERE room_id = ?
       ORDER BY sent_at DESC
       LIMIT 1`
    )
    .get(roomId) as { sent_at: string } | undefined;
}

export function closeDb(): void {
  if (db) {
    db.close();
    logger.info("Database connection closed");
  }
}
