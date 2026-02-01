import crypto from 'crypto'
import { getCloudflareEnv } from '@/lib/cloudflare'
import type { D1Database } from './types'

let tablesReady = false

export const getDatabase = async (): Promise<D1Database> => {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  return env.D1 as D1Database
}

/**
 * Hash IP address using HMAC-SHA256 for privacy and security
 * Uses PAYLOAD_SECRET as the HMAC key for cryptographic security
 * HMAC prevents length extension attacks and provides authentication
 * @throws Error if PAYLOAD_SECRET is not configured
 */
export const hashIp = (ip: string | null): string | null => {
  if (!ip) return null
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable is required for IP hashing')
  }
  // Use HMAC-SHA256 instead of plain SHA-256 for cryptographic security
  return crypto.createHmac('sha256', secret).update(ip).digest('hex')
}

export const ensureAnalyticsTables = async (db: D1Database): Promise<void> => {
  if (tablesReady) return

  await db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      tool_slug TEXT,
      context TEXT,
      url TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      metadata TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      lead_magnet TEXT,
      source TEXT,
      status TEXT DEFAULT 'active',
      preferences TEXT,
      unsubscribed_at TEXT,
      unsubscribe_reason TEXT,
      unsubscribe_feedback TEXT,
      updated_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      topic TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS case_study_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT,
      url TEXT,
      summary TEXT,
      metrics TEXT,
      tools TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      slug TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(content_type, slug, ip_hash)
    );
  `)

  tablesReady = true
}
