import { NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring'

interface ErrorReport {
  message: string
  name: string
  stack?: string
  timestamp?: string
  environment?: string
  context?: {
    url?: string
    userAgent?: string
    component?: string
    [key: string]: unknown
  }
}

/**
 * Error reporting endpoint for client-side errors
 * Receives error reports from browser and logs them
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ErrorReport

    // Validate error report structure
    if (!body.message || !body.name) {
      return NextResponse.json(
        { error: 'Invalid error report' },
        { status: 400 }
      )
    }

    // Log the client-side error
    logger.error('Client-side error reported', undefined, {
      message: body.message,
      name: body.name,
      stack: body.stack,
      timestamp: body.timestamp,
      environment: body.environment,
      context: body.context,
      url: body.context?.url,
      userAgent: body.context?.userAgent,
      component: body.context?.component,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    logger.error('Failed to process error report', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}
