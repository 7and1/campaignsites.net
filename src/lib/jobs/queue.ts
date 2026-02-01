/**
 * Background job queue system
 * Handles long-running tasks asynchronously
 */

import { getCloudflareEnv } from '@/lib/cloudflare'
import type { D1Database } from '@/lib/types'
import { logError } from '@/lib/errors'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type JobType = 'email' | 'analytics' | 'cache-invalidation' | 'data-export' | 'webhook'

export interface Job {
  id?: number
  type: JobType
  payload: Record<string, unknown>
  status: JobStatus
  priority: number
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  createdAt?: Date
}

export interface JobStats {
  pending: number
  processing: number
  completed: number
  failed: number
  total: number
}

let tablesReady = false

const getDatabase = async (): Promise<D1Database> => {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  return env.D1 as D1Database
}

export const ensureJobQueueTables = async (db: D1Database): Promise<void> => {
  if (tablesReady) return

  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      scheduled_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
    CREATE INDEX IF NOT EXISTS idx_job_queue_type ON job_queue(type);
    CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled ON job_queue(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON job_queue(priority DESC);

    CREATE TABLE IF NOT EXISTS job_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES job_queue(id)
    );

    CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
  `)

  tablesReady = true
}

/**
 * Queue a new job
 */
export const queueJob = async (
  type: JobType,
  payload: Record<string, unknown>,
  options?: {
    priority?: number
    maxAttempts?: number
    scheduledAt?: Date
  }
): Promise<number> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  const scheduledAt = options?.scheduledAt || new Date()
  const priority = options?.priority || 0
  const maxAttempts = options?.maxAttempts || 3

  const result = await db
    .prepare(
      `INSERT INTO job_queue (type, payload, priority, max_attempts, scheduled_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(type, JSON.stringify(payload), priority, maxAttempts, scheduledAt.toISOString())
    .run()

  return (result as unknown as { meta: { last_row_id: number } }).meta?.last_row_id || 0
}

/**
 * Get pending jobs ready to process
 */
export const getPendingJobs = async (limit = 10): Promise<Job[]> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  const result = await db
    .prepare(
      `SELECT * FROM job_queue
       WHERE status = 'pending'
       AND scheduled_at <= datetime('now')
       AND attempts < max_attempts
       ORDER BY priority DESC, scheduled_at ASC
       LIMIT ?`
    )
    .bind(limit)
    .all()

  return (result.results as unknown[]).map((row) => ({
    id: (row as { id: number }).id,
    type: (row as { type: JobType }).type,
    payload: JSON.parse((row as { payload: string }).payload),
    status: (row as { status: JobStatus }).status,
    priority: (row as { priority: number }).priority,
    attempts: (row as { attempts: number }).attempts,
    maxAttempts: (row as { max_attempts: number }).max_attempts,
    scheduledAt: new Date((row as { scheduled_at: string }).scheduled_at),
    startedAt: (row as { started_at: string | null }).started_at
      ? new Date((row as { started_at: string }).started_at)
      : undefined,
    completedAt: (row as { completed_at: string | null }).completed_at
      ? new Date((row as { completed_at: string }).completed_at)
      : undefined,
    error: (row as { error: string | null }).error || undefined,
    createdAt: new Date((row as { created_at: string }).created_at),
  }))
}

/**
 * Mark job as processing
 */
export const markJobProcessing = async (jobId: number): Promise<void> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  await db
    .prepare(
      `UPDATE job_queue
       SET status = 'processing',
           started_at = datetime('now'),
           attempts = attempts + 1
       WHERE id = ?`
    )
    .bind(jobId)
    .run()
}

/**
 * Mark job as completed
 */
export const markJobCompleted = async (jobId: number): Promise<void> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  await db
    .prepare(
      `UPDATE job_queue
       SET status = 'completed',
           completed_at = datetime('now')
       WHERE id = ?`
    )
    .bind(jobId)
    .run()
}

/**
 * Mark job as failed
 */
export const markJobFailed = async (jobId: number, error: string): Promise<void> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  // Check if max attempts reached
  const { results } = await db.prepare(`SELECT attempts, max_attempts FROM job_queue WHERE id = ?`).bind(jobId).all()
  const job = results[0]

  const attempts = (job as { attempts: number } | null)?.attempts || 0
  const maxAttempts = (job as { max_attempts: number } | null)?.max_attempts || 3

  const status = attempts >= maxAttempts ? 'failed' : 'pending'

  await db
    .prepare(
      `UPDATE job_queue
       SET status = ?,
           error = ?
       WHERE id = ?`
    )
    .bind(status, error.substring(0, 1000), jobId)
    .run()
}

/**
 * Log job message
 */
export const logJobMessage = async (
  jobId: number,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  await db
    .prepare(
      `INSERT INTO job_logs (job_id, level, message, metadata)
       VALUES (?, ?, ?, ?)`
    )
    .bind(jobId, level, message, metadata ? JSON.stringify(metadata) : null)
    .run()
}

/**
 * Get job statistics
 */
export const getJobStats = async (): Promise<JobStats> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  const result = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        COUNT(*) as total
      FROM job_queue`
    )
    .all()

  const row = result.results[0] as {
    pending: number
    processing: number
    completed: number
    failed: number
    total: number
  }

  return {
    pending: row?.pending || 0,
    processing: row?.processing || 0,
    completed: row?.completed || 0,
    failed: row?.failed || 0,
    total: row?.total || 0,
  }
}

/**
 * Process jobs (to be called by a cron job or worker)
 */
export const processJobs = async (
  processor: (job: Job) => Promise<void>,
  options?: { limit?: number }
): Promise<{ processed: number; succeeded: number; failed: number }> => {
  const limit = options?.limit || 10
  const jobs = await getPendingJobs(limit)

  let succeeded = 0
  let failed = 0

  for (const job of jobs) {
    if (!job.id) continue

    try {
      await markJobProcessing(job.id)
      await logJobMessage(job.id, 'info', `Processing job ${job.type}`)

      await processor(job)

      await markJobCompleted(job.id)
      await logJobMessage(job.id, 'info', 'Job completed successfully')
      succeeded++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      await markJobFailed(job.id, errorMessage)
      await logJobMessage(job.id, 'error', `Job failed: ${errorMessage}`)
      logError(`job-${job.type}`, error)
      failed++
    }
  }

  return { processed: jobs.length, succeeded, failed }
}

/**
 * Cancel a job
 */
export const cancelJob = async (jobId: number): Promise<void> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  await db
    .prepare(
      `UPDATE job_queue
       SET status = 'cancelled'
       WHERE id = ? AND status = 'pending'`
    )
    .bind(jobId)
    .run()
}

/**
 * Clean up old completed/failed jobs
 */
export const cleanupOldJobs = async (daysOld = 30): Promise<number> => {
  const db = await getDatabase()
  await ensureJobQueueTables(db)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const result = await db
    .prepare(
      `DELETE FROM job_queue
       WHERE status IN ('completed', 'failed', 'cancelled')
       AND created_at < ?`
    )
    .bind(cutoffDate.toISOString())
    .run()

  return (result as unknown as { meta: { changes: number } }).meta?.changes || 0
}
