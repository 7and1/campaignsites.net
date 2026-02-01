/**
 * Database migration to add indexes for query optimization
 * Run this to optimize existing database
 */

import { getCloudflareEnv } from '@/lib/cloudflare'
import type { D1Database } from '@/lib/types'

export async function addDatabaseIndexes(): Promise<void> {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  const db = env.D1 as D1Database

  // Add indexes for analytics queries
  await db.exec(`
    -- Analytics event indexes
    CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_tool_created ON analytics_events(tool_slug, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

    -- Newsletter subscriber indexes
    CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
    CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_subscribers(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_newsletter_lead_magnet ON newsletter_subscribers(lead_magnet);

    -- Email queue indexes (already exist but ensuring)
    CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON email_queue(status, scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_email_queue_template_status ON email_queue(template_id, status);

    -- Job queue indexes
    CREATE INDEX IF NOT EXISTS idx_job_queue_status_scheduled ON job_queue(status, scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_job_queue_type_status ON job_queue(type, status);

    -- Upvotes indexes
    CREATE INDEX IF NOT EXISTS idx_upvotes_content_slug ON upvotes(content_type, slug);
    CREATE INDEX IF NOT EXISTS idx_upvotes_created ON upvotes(created_at DESC);

    -- Contact messages indexes
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages(email);

    -- Case study submissions indexes
    CREATE INDEX IF NOT EXISTS idx_case_study_status ON case_study_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_case_study_created ON case_study_submissions(created_at DESC);
  `)

  console.log('Database indexes added successfully')
}

/**
 * Analyze query performance
 */
export async function analyzeQueryPerformance(query: string): Promise<string> {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  const db = env.D1 as D1Database

  const result = await db.prepare(`EXPLAIN QUERY PLAN ${query}`).all()
  return JSON.stringify(result.results, null, 2)
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  tables: Array<{ name: string; rows: number }>
  totalSize: number
}> {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  const db = env.D1 as D1Database

  // Get table names
  const tablesResult = await db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
    .all()

  const tables = []
  for (const table of tablesResult.results as Array<{ name: string }>) {
    const countResult = await db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).first()
    tables.push({
      name: table.name,
      rows: (countResult as { count: number } | null)?.count || 0,
    })
  }

  return {
    tables,
    totalSize: 0, // D1 doesn't expose size directly
  }
}

/**
 * Vacuum database to reclaim space and optimize
 */
export async function vacuumDatabase(): Promise<void> {
  const env = await getCloudflareEnv()
  if (!env?.D1) throw new Error('D1 binding is missing')
  const db = env.D1 as D1Database

  await db.exec('VACUUM')
  await db.exec('ANALYZE')

  console.log('Database vacuumed and analyzed')
}
