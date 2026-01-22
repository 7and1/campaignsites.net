/**
 * Test mocks and utilities
 */

import { vi } from 'vitest'

/**
 * Mock D1 database for testing
 */
export function createMockD1Database(results: unknown[] = []): any {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        run: vi.fn(async () => ({ success: true })),
        all: vi.fn(async () => ({ results })),
        first: vi.fn(async () => results[0]),
      })),
    })),
    exec: vi.fn(async () => ({ success: true })),
    batch: vi.fn(async () => [{ success: true }]),
  }
}

/**
 * Mock Cloudflare environment
 */
export function createMockCloudflareEnv(overrides: any = {}): any {
  return {
    D1: createMockD1Database(),
    R2: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
    ...overrides,
  }
}

/**
 * Mock getCloudflareEnv function
 */
export function mockCloudflareEnv(env: any) {
  vi.doMock('@/lib/cloudflare', () => ({
    getCloudflareEnv: vi.fn(async () => env),
  }))
}

/**
 * Creates a mock Next.js Request with custom properties
 */
export function createMockRequest(
  url: string,
  options: RequestInit = {},
  overrides: Record<string, unknown> = {}
): Request {
  const request = new Request(url, options)

  // Apply overrides for testing headers
  Object.entries(overrides).forEach(([key, value]) => {
    if (key === 'headers' && typeof value === 'object') {
      Object.entries(value as Record<string, string>).forEach(
        ([headerName, headerValue]) => {
          request.headers.set(headerName, headerValue)
        }
      )
    }
  })

  return request
}

/**
 * Mock fetch with response
 */
export function mockFetch(response: any) {
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => response,
    text: async () => JSON.stringify(response),
    ...response,
  }))
}

/**
 * Mock fetch error
 */
export function mockFetchError(message: string = 'Network error') {
  global.fetch = vi.fn(async () => {
    throw new Error(message)
  })
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  vi.clearAllMocks()
  vi.resetModules()
}
