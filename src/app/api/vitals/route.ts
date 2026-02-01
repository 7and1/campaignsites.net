import { NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring'

interface VitalMetric {
  name: string
  value: number
  rating?: string
  timestamp?: number
}

/**
 * Web Vitals reporting endpoint
 * Receives performance metrics from browser
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VitalMetric

    // Validate metric structure
    if (!body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric' },
        { status: 400 }
      )
    }

    // Log the performance metric
    logger.perf(body.name, body.value, {
      rating: body.rating,
      timestamp: body.timestamp,
    })

    // Track poor performance
    if (body.rating === 'poor') {
      logger.warn('Poor Web Vital detected', {
        metric: body.name,
        value: body.value,
        rating: body.rating,
      })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    logger.error('Failed to process vitals report', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Failed to process vitals report' },
      { status: 500 }
    )
  }
}
