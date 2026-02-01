/**
 * Error tracking and monitoring for Cloudflare Workers
 * Integrates with Cloudflare Workers Analytics
 */

import { logger } from './logger'

export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  component?: string
  action?: string
  [key: string]: unknown
}

export interface ErrorReport {
  message: string
  stack?: string
  name: string
  timestamp: string
  environment: string
  context?: ErrorContext
}

/**
 * Track error with Cloudflare Workers Analytics
 */
export function trackError(error: Error, context?: ErrorContext): void {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    name: error.name,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    context,
  }

  // Log to structured logger
  logger.error(error.message, error, context)

  // Send to Cloudflare Analytics if available
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([JSON.stringify(errorReport)], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/errors', blob)
    } catch {
      // Silently fail if beacon not available
    }
  }
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), context)
      throw error
    }
  }) as T
}

/**
 * Create error boundary handler for React components
 */
export function createErrorHandler(componentName: string) {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    trackError(error, {
      component: componentName,
      componentStack: errorInfo?.componentStack,
    })
  }
}

/**
 * Track API errors with additional context
 */
export function trackApiError(
  error: Error,
  request: {
    method: string
    url: string
    headers?: Record<string, string>
  },
  response?: {
    status: number
    statusText: string
  }
): void {
  trackError(error, {
    action: 'api_request',
    method: request.method,
    url: request.url,
    responseStatus: response?.status,
    responseStatusText: response?.statusText,
  })
}

/**
 * Track performance issues
 */
export function trackPerformanceIssue(
  metric: string,
  value: number,
  threshold: number,
  context?: ErrorContext
): void {
  if (value > threshold) {
    logger.warn(`Performance threshold exceeded: ${metric}`, {
      ...context,
      metric,
      value,
      threshold,
      exceeded: value - threshold,
    })
  }
}
