import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { logger } from '@/lib/monitoring/logger'

/**
 * Health check endpoint for monitoring and load balancers
 * Checks: Database connectivity, Payload CMS status, External dependencies, System metrics
 */
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error' | 'degraded'; message?: string; responseTime?: number }> = {}
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  try {
    // Check Payload CMS / Database
    try {
      const dbStart = Date.now()
      const payload = await getPayload({ config })
      // Try a simple query to verify database connectivity
      await payload.find({
        collection: 'posts',
        limit: 1,
        depth: 0,
      })
      const dbTime = Date.now() - dbStart
      checks.database = {
        status: dbTime > 1000 ? 'degraded' : 'ok',
        responseTime: dbTime
      }
      if (dbTime > 1000) overallStatus = 'degraded'
    } catch (error) {
      checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database connection failed',
      }
      overallStatus = 'unhealthy'
    }

    // Check Payload CMS
    try {
      const cmsStart = Date.now()
      await getPayload({ config })
      const cmsTime = Date.now() - cmsStart
      checks.payload = {
        status: 'ok',
        responseTime: cmsTime
      }
    } catch (error) {
      checks.payload = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Payload CMS unavailable',
      }
      overallStatus = 'unhealthy'
    }

    // Check OpenAI API (if configured)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiStart = Date.now()
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000),
        })
        const openaiTime = Date.now() - openaiStart
        checks.openai = {
          status: response.ok ? 'ok' : 'error',
          message: response.ok ? undefined : `HTTP ${response.status}`,
          responseTime: openaiTime,
        }
        if (!response.ok && overallStatus === 'healthy') overallStatus = 'degraded'
      } catch (error) {
        checks.openai = {
          status: 'error',
          message: error instanceof Error ? error.message : 'OpenAI API unavailable',
        }
        if (overallStatus === 'healthy') overallStatus = 'degraded'
      }
    } else {
      checks.openai = { status: 'ok', message: 'Not configured' }
    }

    // Check Resend API (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const resendStart = Date.now()
        const response = await fetch('https://api.resend.com/emails', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000),
        })
        const resendTime = Date.now() - resendStart
        checks.resend = {
          status: response.ok || response.status === 401 ? 'ok' : 'error',
          message: response.ok || response.status === 401 ? undefined : `HTTP ${response.status}`,
          responseTime: resendTime,
        }
        if (!response.ok && response.status !== 401 && overallStatus === 'healthy') {
          overallStatus = 'degraded'
        }
      } catch (error) {
        checks.resend = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Resend API unavailable',
        }
        if (overallStatus === 'healthy') overallStatus = 'degraded'
      }
    } else {
      checks.resend = { status: 'ok', message: 'Not configured' }
    }

    // Memory metrics (if available)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      try {
        const memory = process.memoryUsage()
        const memoryMB = {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          external: Math.round(memory.external / 1024 / 1024),
        }
        checks.memory = {
          status: memoryMB.heapUsed > 400 ? 'degraded' : 'ok',
          message: `${memoryMB.heapUsed}MB / ${memoryMB.heapTotal}MB`,
        }
      } catch {
        // Memory check not critical
      }
    }

    const responseTime = Date.now() - startTime

    // Log health check results
    logger.info('Health check completed', {
      status: overallStatus,
      responseTime,
      checks: Object.keys(checks),
    })

    const statusCode = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        environment: process.env.NODE_ENV,
        checks,
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check execution failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }
}

/**
 * HEAD request for simple load balancer health checks
 * Returns 200 if healthy, 503 if not
 */
export async function HEAD() {
  try {
    const payload = await getPayload({ config })
    await payload.find({
      collection: 'posts',
      limit: 1,
      depth: 0,
    })

    return new Response(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
}
