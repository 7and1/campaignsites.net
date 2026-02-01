/**
 * API middleware for request/response logging and monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import { trackApiError } from './error-tracker'

export interface ApiMiddlewareOptions {
  logRequests?: boolean
  logResponses?: boolean
  trackErrors?: boolean
  excludePaths?: string[]
}

/**
 * Wrap API handler with monitoring
 */
export function withMonitoring<T extends (request: Request, ...args: unknown[]) => Promise<Response | NextResponse>>(
  handler: T,
  options: ApiMiddlewareOptions = {}
): T {
  const {
    logRequests = true,
    logResponses = true,
    trackErrors = true,
    excludePaths = [],
  } = options

  return (async (request: Request, ...args: unknown[]) => {
    const startTime = Date.now()

    // Extract request details
    const method = request.method
    const url = new URL(request.url)
    const path = url.pathname

    // Skip excluded paths
    if (excludePaths.some(excluded => path.startsWith(excluded))) {
      return handler(request, ...args)
    }

    // Log request
    if (logRequests) {
      logger.info(`${method} ${path}`, {
        method,
        path,
        query: Object.fromEntries(url.searchParams),
        userAgent: request.headers.get('user-agent') || undefined,
      })
    }

    try {
      // Execute handler
      const response = await handler(request, ...args)
      const duration = Date.now() - startTime

      // Extract status code
      const status = response instanceof NextResponse ? response.status : (response as Response).status

      // Log response
      if (logResponses) {
        logger.http(method, path, status, duration)
      }

      // Track slow requests
      if (duration > 3000) {
        logger.warn('Slow API request', {
          method,
          path,
          duration,
          status,
        })
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Track error
      if (trackErrors && error instanceof Error) {
        trackApiError(error, {
          method,
          url: path,
          headers: {
            'user-agent': request.headers.get('user-agent') || 'unknown',
          },
        })
      }

      // Log error
      logger.error(`${method} ${path} failed`, error instanceof Error ? error : undefined, {
        method,
        path,
        duration,
      })

      throw error
    }
  }) as T
}

/**
 * Create a monitored API response
 */
export function createMonitoredResponse(
  data: unknown,
  options: {
    status?: number
    headers?: Record<string, string>
    context?: Record<string, unknown>
  } = {}
): NextResponse {
  const { status = 200, headers = {}, context } = options

  if (context) {
    logger.debug('API response', context)
  }

  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * Create a monitored error response
 */
export function createErrorResponse(
  error: Error | string,
  options: {
    status?: number
    context?: Record<string, unknown>
  } = {}
): NextResponse {
  const { status = 500, context } = options
  const message = typeof error === 'string' ? error : error.message

  logger.error('API error response', typeof error === 'string' ? undefined : error, {
    ...context,
    status,
  })

  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
