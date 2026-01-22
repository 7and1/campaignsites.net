import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AffiliateCTA } from '@/components/AffiliateCTA'

describe('AffiliateCTA', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <AffiliateCTA href="https://example.com" toolSlug="test-tool" context="test-context">
        Click Here
      </AffiliateCTA>
    )

    expect(screen.getByText('Click Here')).toBeInTheDocument()
  })

  it('renders link with correct href', () => {
    render(
      <AffiliateCTA href="https://example.com/offer" toolSlug="test-tool">
        Offer
      </AffiliateCTA>
    )

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('https://example.com/offer')
  })

  it('opens link in new tab', () => {
    render(
      <AffiliateCTA href="https://example.com" toolSlug="test-tool">
        Link
      </AffiliateCTA>
    )

    const link = screen.getByRole('link')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('includes rel attributes for affiliate links', () => {
    render(
      <AffiliateCTA href="https://example.com" toolSlug="test-tool">
        Link
      </AffiliateCTA>
    )

    const link = screen.getByRole('link')
    expect(link.getAttribute('rel')).toBe('noopener sponsored')
  })

  it('includes data attributes for tracking', () => {
    render(
      <AffiliateCTA href="https://example.com" toolSlug="my-tool" context="sidebar">
        Link
      </AffiliateCTA>
    )

    const link = screen.getByRole('link')
    expect(link.getAttribute('data-affiliate')).toBe('my-tool')
    expect(link.getAttribute('data-context')).toBe('sidebar')
  })

  it('applies custom className', () => {
    render(
      <AffiliateCTA
        href="https://example.com"
        toolSlug="test-tool"
        className="custom-class another-class"
      >
        Link
      </AffiliateCTA>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-class')
    expect(link).toHaveClass('another-class')
  })

  it('works without optional parameters', () => {
    render(<AffiliateCTA>Just a link</AffiliateCTA>)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('#')
    expect(link.getAttribute('data-affiliate')).toBeNull()
    expect(link.getAttribute('data-context')).toBeNull()
  })
})
