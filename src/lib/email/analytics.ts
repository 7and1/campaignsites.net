/**
 * Email analytics tracking system
 * Tracks opens, clicks, and delivery status
 */

import { getCloudflareEnv } from '@/lib/cloudflare'
import type { D1Database } from '@/lib/types'
import { logError } from '@/lib/errors'

export interface EmailEvent {
  id?: number
  emailId: string
  subscriberEmail: string
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt?: Date
}

export interface EmailAnalytics {
  emailId: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  openRate: number
  clickRate: number
  bounceRate: number
}

let tablesReady = false

const getDatabase = async (): Promise<D1Database> => {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  return env.D1 as D1Database
}

export const ensureEmailAnalyticsTables = async (db: D1Database): Promise<void> => {
  if (tablesReady) return

  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT NOT NULL,
      subscriber_email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metadata TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
    CREATE INDEX IF NOT EXISTS idx_email_events_subscriber ON email_events(subscriber_email);
    CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_email_events_created ON email_events(created_at);

    CREATE TABLE IF NOT EXISTS email_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT NOT NULL,
      url TEXT NOT NULL,
      link_id TEXT NOT NULL UNIQUE,
      clicks INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_email_links_email_id ON email_links(email_id);
    CREATE INDEX IF NOT EXISTS idx_email_links_link_id ON email_links(link_id);
  `)

  tablesReady = true
}

/**
 * Track email event
 */
export const trackEmailEvent = async (event: Omit<EmailEvent, 'id' | 'createdAt'>): Promise<number> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  const result = await db
    .prepare(
      `INSERT INTO email_events (email_id, subscriber_email, event_type, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.emailId,
      event.subscriberEmail,
      event.eventType,
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.ipAddress || null,
      event.userAgent || null
    )
    .run()

  return (result as unknown as { meta: { last_row_id: number } }).meta?.last_row_id || 0
}

/**
 * Generate tracking pixel URL
 */
export function generateTrackingPixelUrl(emailId: string, subscriberEmail: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campaignsites.net'
  const token = generateTrackingToken(emailId, subscriberEmail)
  return `${baseUrl}/api/v1/email/track/open?id=${emailId}&token=${token}`
}

/**
 * Generate click tracking URL
 */
export function generateClickTrackingUrl(emailId: string, subscriberEmail: string, targetUrl: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campaignsites.net'
  const token = generateTrackingToken(emailId, subscriberEmail)
  const encodedUrl = encodeURIComponent(targetUrl)
  return `${baseUrl}/api/v1/email/track/click?id=${emailId}&token=${token}&url=${encodedUrl}`
}

/**
 * Generate secure tracking token
 */
function generateTrackingToken(emailId: string, subscriberEmail: string): string {
  const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
  const data = `${emailId}:${subscriberEmail}:${secret}`

  // Simple hash for tracking token
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Verify tracking token
 */
export function verifyTrackingToken(emailId: string, subscriberEmail: string, token: string): boolean {
  const expectedToken = generateTrackingToken(emailId, subscriberEmail)
  return token === expectedToken
}

/**
 * Register email link for tracking
 */
export const registerEmailLink = async (emailId: string, url: string): Promise<string> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  // Generate unique link ID
  const linkId = generateLinkId(emailId, url)

  await db
    .prepare(
      `INSERT OR IGNORE INTO email_links (email_id, url, link_id)
       VALUES (?, ?, ?)`
    )
    .bind(emailId, url, linkId)
    .run()

  return linkId
}

/**
 * Generate link ID
 */
function generateLinkId(emailId: string, url: string): string {
  const data = `${emailId}:${url}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Track link click
 */
export const trackLinkClick = async (linkId: string): Promise<void> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  await db
    .prepare(
      `UPDATE email_links
       SET clicks = clicks + 1
       WHERE link_id = ?`
    )
    .bind(linkId)
    .run()
}

/**
 * Get email analytics
 */
export const getEmailAnalytics = async (emailId: string): Promise<EmailAnalytics> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  const result = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN event_type = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN event_type = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN event_type = 'opened' THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN event_type = 'clicked' THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN event_type = 'bounced' THEN 1 ELSE 0 END) as bounced,
        SUM(CASE WHEN event_type = 'complained' THEN 1 ELSE 0 END) as complained
      FROM email_events
      WHERE email_id = ?`
    )
    .bind(emailId)
    .first()

  const row = result as {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
  } | null

  const sent = row?.sent || 0
  const delivered = row?.delivered || 0
  const opened = row?.opened || 0
  const clicked = row?.clicked || 0
  const bounced = row?.bounced || 0
  const complained = row?.complained || 0

  return {
    emailId,
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    complained,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
    bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
  }
}

/**
 * Get subscriber email history
 */
export const getSubscriberEmailHistory = async (subscriberEmail: string): Promise<EmailEvent[]> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  const result = await db
    .prepare(
      `SELECT * FROM email_events
       WHERE subscriber_email = ?
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .bind(subscriberEmail)
    .all()

  return (result.results as unknown[]).map((row) => ({
    id: (row as { id: number }).id,
    emailId: (row as { email_id: string }).email_id,
    subscriberEmail: (row as { subscriber_email: string }).subscriber_email,
    eventType: (row as { event_type: EmailEvent['eventType'] }).event_type,
    metadata: (row as { metadata: string | null }).metadata
      ? JSON.parse((row as { metadata: string }).metadata)
      : undefined,
    ipAddress: (row as { ip_address: string | null }).ip_address || undefined,
    userAgent: (row as { user_agent: string | null }).user_agent || undefined,
    createdAt: new Date((row as { created_at: string }).created_at),
  }))
}

/**
 * Get top clicked links for an email
 */
export const getTopClickedLinks = async (emailId: string, limit = 10): Promise<Array<{ url: string; clicks: number }>> => {
  const db = await getDatabase()
  await ensureEmailAnalyticsTables(db)

  const result = await db
    .prepare(
      `SELECT url, clicks
       FROM email_links
       WHERE email_id = ?
       ORDER BY clicks DESC
       LIMIT ?`
    )
    .bind(emailId, limit)
    .all()

  return (result.results as unknown[]).map((row) => ({
    url: (row as { url: string }).url,
    clicks: (row as { clicks: number }).clicks,
  }))
}

/**
 * Inject tracking pixel into HTML email
 */
export function injectTrackingPixel(html: string, emailId: string, subscriberEmail: string): string {
  const pixelUrl = generateTrackingPixelUrl(emailId, subscriberEmail)
  const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;border:0;outline:none;" />`

  // Insert before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`)
  }

  // Otherwise append to end
  return html + trackingPixel
}

/**
 * Replace links with tracking URLs in HTML email
 */
export function injectClickTracking(html: string, emailId: string, subscriberEmail: string): string {
  // Match all href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi

  return html.replace(hrefRegex, (match, url) => {
    // Skip mailto, tel, and anchor links
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
      return match
    }

    const trackingUrl = generateClickTrackingUrl(emailId, subscriberEmail, url)
    return `href="${trackingUrl}"`
  })
}
