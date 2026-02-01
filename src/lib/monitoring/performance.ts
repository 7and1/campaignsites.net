/**
 * Performance monitoring utilities
 * Tracks Web Vitals and custom metrics
 */

import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

/**
 * Web Vitals thresholds (in milliseconds)
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint
}

/**
 * Get rating based on value and thresholds
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report Web Vital metric
 */
export function reportWebVital(metric: {
  name: string
  value: number
  id: string
  rating?: string
}): void {
  const thresholds = THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
  const rating = thresholds ? getRating(metric.value, thresholds) : metric.rating || 'good'

  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: rating as 'good' | 'needs-improvement' | 'poor',
    timestamp: Date.now(),
  }

  // Log to structured logger
  logger.perf(metric.name, metric.value, {
    id: metric.id,
    rating,
  })

  // Send to analytics endpoint
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([JSON.stringify(performanceMetric)], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/vitals', blob)
    } catch {
      // Silently fail
    }
  }
}

/**
 * Measure async operation performance
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.perf(operation, duration, { status: 'success' })
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.perf(operation, duration, { status: 'error' })
    throw error
  }
}

/**
 * Measure sync operation performance
 */
export function measureSync<T>(operation: string, fn: () => T): T {
  const start = Date.now()
  try {
    const result = fn()
    const duration = Date.now() - start
    logger.perf(operation, duration, { status: 'success' })
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.perf(operation, duration, { status: 'error' })
    throw error
  }
}

/**
 * Create a performance timer
 */
export class PerformanceTimer {
  private startTime: number
  private marks: Map<string, number> = new Map()

  constructor(private operation: string) {
    this.startTime = Date.now()
  }

  mark(label: string): void {
    this.marks.set(label, Date.now() - this.startTime)
  }

  end(context?: Record<string, unknown>): number {
    const duration = Date.now() - this.startTime
    const marks = Object.fromEntries(this.marks)
    logger.perf(this.operation, duration, { ...context, marks })
    return duration
  }
}

/**
 * Monitor API request performance
 */
export function monitorApiRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
): void {
  logger.http(method, path, statusCode, durationMs)

  // Track slow requests
  if (durationMs > 3000) {
    logger.warn('Slow API request detected', {
      method,
      path,
      statusCode,
      durationMs,
    })
  }
}
