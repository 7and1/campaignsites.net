import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'
import { trackSchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '@/lib/rate-limit'
import { sanitizeUtm } from '@/lib/sanitization'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'

async function handler(request: Request) {
  try {
    // Rate limiting: 100 requests per minute per IP for analytics
    await ensureRateLimitTable()
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, {
      limit: 100,
      window: 60 * 1000, // 1 minute
      identifier: 'track',
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many tracking requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validationResult = trackSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { eventType, toolSlug, context, url, utm, metadata } = validationResult.data

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip')

    const ipHash = hashIp(ip)
    const userAgent = request.headers.get('user-agent')?.substring(0, 500) || null

    // Sanitize UTM parameters
    const sanitizedUtm = sanitizeUtm(utm || {})

    await db
      .prepare(
        `INSERT INTO analytics_events (event_type, tool_slug, context, url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, metadata, ip_hash, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        eventType,
        toolSlug || null,
        context || null,
        url || null,
        sanitizedUtm.utm_source || null,
        sanitizedUtm.utm_medium || null,
        sanitizedUtm.utm_campaign || null,
        sanitizedUtm.utm_term || null,
        sanitizedUtm.utm_content || null,
        metadata ? JSON.stringify(metadata) : null,
        ipHash,
        userAgent
      )
      .run()

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        },
      }
    )
  } catch (error) {
    logError('track', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

import crypto from 'crypto'

function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable is required for IP hashing')
  }
  return crypto.createHmac('sha256', secret).update(ip).digest('hex')
}

export const POST = withMonitoring(handler)
