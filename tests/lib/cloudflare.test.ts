import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('cloudflare module', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('exports getCloudflareEnv function', async () => {
    const module = await import('@/lib/cloudflare')
    expect(module).toBeDefined()
    expect(typeof module.getCloudflareEnv).toBe('function')
  })

  it('has correct module structure', async () => {
    const module = await import('@/lib/cloudflare')
    expect(Object.keys(module)).toContain('getCloudflareEnv')
  })
})
