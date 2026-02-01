/**
 * Structured logging utility for CampaignSites.net
 * Replaces console.log with structured JSON logs for better observability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  environment: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const SERVICE_NAME = 'campaignsites'
const ENVIRONMENT = process.env.NODE_ENV || 'development'

const isDevelopment = ENVIRONMENT === 'development'

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: SERVICE_NAME,
    environment: ENVIRONMENT,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    }
  }

  return entry
}

/**
 * Output log entry to console
 */
function outputLog(entry: LogEntry): void {
  if (isDevelopment) {
    // Pretty print in development
    const colorMap: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const color = colorMap[entry.level]

    console.log(
      `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`
    )
    if (entry.context) {
      console.log('  Context:', entry.context)
    }
    if (entry.error) {
      console.log('  Error:', entry.error)
    }
  } else {
    // JSON output in production for log aggregation
    console.log(JSON.stringify(entry))
  }
}

/**
 * Logger instance with structured logging methods
 */
export const logger = {
  debug: (message: string, context?: LogContext): void => {
    if (isDevelopment) {
      outputLog(createLogEntry('debug', message, context))
    }
  },

  info: (message: string, context?: LogContext): void => {
    outputLog(createLogEntry('info', message, context))
  },

  warn: (message: string, context?: LogContext): void => {
    outputLog(createLogEntry('warn', message, context))
  },

  error: (message: string, error?: Error, context?: LogContext): void => {
    outputLog(createLogEntry('error', message, context, error))
  },

  /**
   * Log HTTP request/response for API endpoints
   */
  http: (
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: LogContext
  ): void => {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    outputLog(
      createLogEntry(level, `${method} ${path} ${statusCode}`, {
        ...context,
        method,
        path,
        statusCode,
        durationMs,
      })
    )
  },

  /**
   * Log performance metrics
   */
  perf: (operation: string, durationMs: number, context?: LogContext): void => {
    outputLog(
      createLogEntry('info', `Performance: ${operation}`, {
        ...context,
        operation,
        durationMs,
      })
    )
  },
}

/**
 * Create a child logger with preset context
 */
export function createChildLogger(parentContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...parentContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...parentContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...parentContext, ...context }),
    error: (message: string, error?: Error, context?: LogContext) =>
      logger.error(message, error, { ...parentContext, ...context }),
  }
}
