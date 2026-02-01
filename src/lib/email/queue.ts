import { getCloudflareEnv } from '@/lib/cloudflare'
import type { D1Database } from '@/lib/types'

export interface EmailJob {
  id?: number
  to: string
  from?: string
  subject: string
  html: string
  text?: string
  scheduledAt: Date
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  templateId?: string
  metadata?: Record<string, unknown>
  createdAt?: Date
}

export interface EmailQueueStats {
  pending: number
  sent: number
  failed: number
  total: number
}

let tablesReady = false

const getDatabase = async (): Promise<D1Database> => {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  return env.D1 as D1Database
}

export const ensureEmailQueueTables = async (db: D1Database): Promise<void> => {
  if (tablesReady) return

  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      from_email TEXT,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      text_body TEXT,
      scheduled_at TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      template_id TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      sent_at TEXT,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
    CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_email_queue_template ON email_queue(template_id);

    CREATE TABLE IF NOT EXISTS email_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriber_email TEXT NOT NULL,
      sequence_type TEXT NOT NULL,
      current_step INTEGER DEFAULT 0,
      total_steps INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      metadata TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_email_sequences_email ON email_sequences(subscriber_email);
    CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
  `)

  tablesReady = true
}

export const queueEmail = async (job: Omit<EmailJob, 'id' | 'createdAt'>): Promise<number> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  const result = await db
    .prepare(
      `INSERT INTO email_queue (to_email, from_email, subject, html_body, text_body, scheduled_at, status, template_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      job.to,
      job.from || null,
      job.subject,
      job.html,
      job.text || null,
      job.scheduledAt.toISOString(),
      job.status,
      job.templateId || null,
      job.metadata ? JSON.stringify(job.metadata) : null
    )
    .run()

  return (result as unknown as { meta: { last_row_id: number } }).meta?.last_row_id || 0
}

export const getPendingEmails = async (limit = 100): Promise<EmailJob[]> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  const result = await db
    .prepare(
      `SELECT * FROM email_queue 
       WHERE status = 'pending' AND scheduled_at <= datetime('now')
       ORDER BY scheduled_at ASC
       LIMIT ?`
    )
    .bind(limit)
    .all()

  return (result.results as unknown[]).map((row) => ({
    id: (row as { id: number }).id,
    to: (row as { to_email: string }).to_email,
    from: (row as { from_email: string | null }).from_email || undefined,
    subject: (row as { subject: string }).subject,
    html: (row as { html_body: string }).html_body,
    text: (row as { text_body: string | null }).text_body || undefined,
    scheduledAt: new Date((row as { scheduled_at: string }).scheduled_at),
    status: (row as { status: 'pending' | 'sent' | 'failed' | 'cancelled' }).status,
    templateId: (row as { template_id: string | null }).template_id || undefined,
    metadata: (row as { metadata: string | null }).metadata
      ? JSON.parse((row as { metadata: string }).metadata)
      : undefined,
    createdAt: new Date((row as { created_at: string }).created_at),
  }))
}

export const markEmailSent = async (id: number): Promise<void> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  await db
    .prepare(`UPDATE email_queue SET status = 'sent', sent_at = datetime('now') WHERE id = ?`)
    .bind(id)
    .run()
}

export const markEmailFailed = async (id: number, errorMessage: string): Promise<void> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  await db
    .prepare(`UPDATE email_queue SET status = 'failed', error_message = ? WHERE id = ?`)
    .bind(errorMessage.substring(0, 500), id)
    .run()
}

export const getQueueStats = async (): Promise<EmailQueueStats> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  const result = await db
    .prepare(
      `SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        COUNT(*) as total
      FROM email_queue`
    )
    .all()

  const row = result.results[0] as { pending: number; sent: number; failed: number; total: number }
  return {
    pending: row?.pending || 0,
    sent: row?.sent || 0,
    failed: row?.failed || 0,
    total: row?.total || 0,
  }
}

export const startEmailSequence = async (
  subscriberEmail: string,
  sequenceType: string,
  totalSteps: number,
  metadata?: Record<string, unknown>
): Promise<number> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  const result = await db
    .prepare(
      `INSERT INTO email_sequences (subscriber_email, sequence_type, total_steps, metadata)
       VALUES (?, ?, ?, ?)`
    )
    .bind(subscriberEmail, sequenceType, totalSteps, metadata ? JSON.stringify(metadata) : null)
    .run()

  return (result as unknown as { meta: { last_row_id: number } }).meta?.last_row_id || 0
}

export const advanceSequence = async (sequenceId: number): Promise<void> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  await db
    .prepare(
      `UPDATE email_sequences 
       SET current_step = current_step + 1,
           status = CASE WHEN current_step + 1 >= total_steps THEN 'completed' ELSE status END,
           completed_at = CASE WHEN current_step + 1 >= total_steps THEN datetime('now') ELSE completed_at END
       WHERE id = ?`
    )
    .bind(sequenceId)
    .run()
}

export const getActiveSequences = async (subscriberEmail?: string): Promise<unknown[]> => {
  const db = await getDatabase()
  await ensureEmailQueueTables(db)

  let query = `SELECT * FROM email_sequences WHERE status = 'active'`
  const bindings: (string | number)[] = []

  if (subscriberEmail) {
    query += ` AND subscriber_email = ?`
    bindings.push(subscriberEmail)
  }

  const result = await db.prepare(query).bind(...bindings).all()
  return result.results
}

// Resend API integration
export const sendEmailViaResend = async (
  apiKey: string,
  job: EmailJob
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: job.from || 'CampaignSites <hello@campaignsites.net>',
        to: [job.to],
        subject: job.subject,
        html: job.html,
        text: job.text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Process pending emails (to be called by a cron job)
export const processEmailQueue = async (resendApiKey?: string): Promise<{
  processed: number
  sent: number
  failed: number
}> => {
  const apiKey = resendApiKey || process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required to process email queue')
  }

  const pending = await getPendingEmails(100)
  let sent = 0
  let failed = 0

  for (const job of pending) {
    if (!job.id) continue

    const result = await sendEmailViaResend(apiKey, job)

    if (result.success) {
      await markEmailSent(job.id)
      sent++
    } else {
      await markEmailFailed(job.id, result.error || 'Unknown error')
      failed++
    }
  }

  return { processed: pending.length, sent, failed }
}
