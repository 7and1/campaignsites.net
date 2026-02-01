import { NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'
import { processJobs } from '@/lib/jobs/queue'
import { processJob } from '@/lib/jobs/processors'

/**
 * Cron endpoint to process background jobs
 * Should be called by Cloudflare Cron Triggers or external scheduler
 */
async function handler(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET || process.env.PAYLOAD_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process up to 50 jobs per run
    const result = await processJobs(processJob, { limit: 50 })

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logError('cron-jobs', error)
    return NextResponse.json({ error: 'Failed to process jobs' }, { status: 500 })
  }
}

export const GET = withMonitoring(handler)
export const POST = withMonitoring(handler)
