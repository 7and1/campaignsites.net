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
 * Hash IP address with salt for privacy
 * Uses salt from environment or a default fallback
 */
export const hashIp = (ip: string | null): string | null => {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT || 'campaignsites-default-salt-change-in-production'
  return crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex')
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
