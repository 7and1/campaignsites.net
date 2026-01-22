import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock constants
vi.mock('@/lib/constants', () => ({
  EMAIL_REGEX: /\S+@\S+\.\S+/,
}))

// Mock sanitization
vi.mock('@/lib/sanitization', () => ({
  escapeHtml: vi.fn((v: string) => v),
  sanitizeUrl: vi.fn((v: string) => {
    if (!v || v.startsWith('javascript:') || v.startsWith('data:')) return null
    return v
  }),
  validateEmail: vi.fn((v: string) => /\S+@\S+\.\S+/.test(v)),
}))

describe('validation module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports isValidEmail function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.isValidEmail).toBe('function')
  })

  it('exports isValidUrl function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.isValidUrl).toBe('function')
  })

  it('exports sanitizeString function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.sanitizeString).toBe('function')
  })

  it('exports sanitizeEmail function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.sanitizeEmail).toBe('function')
  })

  it('exports isPresent function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.isPresent).toBe('function')
  })

  it('exports validateRequiredFields function', async () => {
    const mod = await import('@/lib/validation')
    expect(typeof mod.validateRequiredFields).toBe('function')
  })
})
