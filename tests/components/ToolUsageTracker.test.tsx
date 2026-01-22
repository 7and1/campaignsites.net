import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { ToolUsageTracker } from '@/components/ToolUsageTracker'

describe('ToolUsageTracker', () => {
  beforeEach(() => {
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://example.com/tools/test-tool' },
    })
    vi.clearAllMocks()
  })

  it('renders null (invisible component)', () => {
    const { container } = render(<ToolUsageTracker tool="utm-builder" />)
    expect(container.firstChild).toBeNull()
  })

  it('accepts tool prop', () => {
    expect(() => render(<ToolUsageTracker tool="budget-calc" />)).not.toThrow()
  })

  it('accepts action prop', () => {
    expect(() => render(<ToolUsageTracker tool="test" action="click" />)).not.toThrow()
  })

  it('renders with default action', () => {
    expect(() => render(<ToolUsageTracker tool="test" />)).not.toThrow()
  })
})
