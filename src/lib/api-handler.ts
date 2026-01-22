import { NextResponse } from 'next/server'
import { ApiError, ErrorCode, logError } from './errors'
import type { ApiResponse, ApiErrorResponse } from './types'

/**
 * Wrap API route handlers with consistent error handling and response formatting
 */
export function withApiHandler<T = unknown>(
  handler: (request: Request, context?: { params: Record<string, string> }) => Promise<ApiResponse<T>>
) {
  return async (request: Request, context?: { params: Record<string, string> }): Promise<NextResponse> => {
    try {
      const result = await handler(request, context)

      if ('ok' in result && result.ok === false) {
        const errorResult = result as ApiErrorResponse
        return NextResponse.json(
          { error: errorResult.error },
          { status: errorResult.statusCode || 400 }
        )
      }

      return NextResponse.json(result)
    } catch (error) {
      logError('api-handler', error)

      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a success response
 */
export function apiSuccess<T = unknown>(
  data?: T,
  message?: string
): ApiResponse<T> {
  return { ok: true, data, message }
}

/**
 * Create an error response
 */
export function apiError(
  error: string,
  statusCode: number = 400
): ApiErrorResponse {
  return { ok: false, error, statusCode }
}

/**
 * Validate required fields and throw ApiError if missing
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter((field) => !data[field])
  
  if (missing.length > 0) {
    throw new ApiError(
      'Missing required fields: ' + missing.join(', '),
      400,
      ErrorCode.VALIDATION_ERROR
    )
  }
}
