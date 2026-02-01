/**
 * Monitoring module exports
 */

export { logger, createChildLogger } from './logger'
export {
  trackError,
  withErrorTracking,
  createErrorHandler,
  trackApiError,
  trackPerformanceIssue,
} from './error-tracker'
export {
  reportWebVital,
  measureAsync,
  measureSync,
  PerformanceTimer,
  monitorApiRequest,
} from './performance'
export {
  withMonitoring,
  createMonitoredResponse,
  createErrorResponse,
} from './api-middleware'
export type { ErrorContext, ErrorReport } from './error-tracker'
export type { PerformanceMetric } from './performance'
export type { ApiMiddlewareOptions } from './api-middleware'
