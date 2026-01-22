import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashIp } from '@/lib/analytics'

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => 'a1b2c3d4e5f6hashedvalue1234567890abcdef'),
      })),
    })),
  },
}))

describe('hashIp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hashes an IPv4 address', () => {
    const result = hashIp('192.168.1.1')
    expect(result).toBe('a1b2c3d4e5f6hashedvalue1234567890abcdef')
  })

  it('hashes an IPv6 address', () => {
    const result = hashIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    expect(result).toBe('a1b2c3d4e5f6hashedvalue1234567890abcdef')
  })

  it('returns null for null input', () => {
    const result = hashIp(null)
    expect(result).toBeNull()
  })

  it('returns null for undefined input', () => {
    const result = hashIp(undefined as unknown as string)
    expect(result).toBeNull()
  })

  it('returns null for empty string', () => {
    const result = hashIp('')
    expect(result).toBeNull()
  })

  it('produces consistent hashes for same input', () => {
    const ip = '10.0.0.1'
    const result1 = hashIp(ip)
    const result2 = hashIp(ip)
    expect(result1).toBe(result2)
  })

  it('handles IP with port', () => {
    const result = hashIp('192.168.1.1:8080')
    expect(result).toBe('a1b2c3d4e5f6hashedvalue1234567890abcdef')
  })

  it('handles localhost', () => {
    const result = hashIp('127.0.0.1')
    expect(result).toBe('a1b2c3d4e5f6hashedvalue1234567890abcdef')
  })
})
