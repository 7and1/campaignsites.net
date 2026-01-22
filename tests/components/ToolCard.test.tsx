import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ToolCard } from '@/components/ToolCard'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calculator: () => <div data-testid="icon">Calculator</div>,
  Link: () => <div data-testid="icon">Link</div>,
  TrendingUp: () => <div data-testid="icon">TrendingUp</div>,
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('ToolCard', () => {
  const mockIcon = () => <div data-testid="icon">Icon</div>

  it('renders tool name and description', () => {
    const { getByText } = render(
      <ToolCard
        name="UTM Builder"
        description="Build UTM tracking links"
        href="/tools/utm-builder"
        icon={mockIcon}
        accent="bg-blue-500"
      />
    )

    expect(getByText('UTM Builder')).toBeInTheDocument()
    expect(getByText('Build UTM tracking links')).toBeInTheDocument()
  })

  it('renders link with correct href', () => {
    const { container } = render(
      <ToolCard
        name="Budget Calculator"
        description="Calculate ad budgets"
        href="/tools/budget"
        icon={mockIcon}
        accent="bg-green-500"
      />
    )

    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/tools/budget')
  })

  it('renders icon', () => {
    const { getByTestId } = render(
      <ToolCard
        name="Test Tool"
        description="Test description"
        href="/test"
        icon={mockIcon}
        accent="bg-purple-500"
      />
    )

    expect(getByTestId('icon')).toBeInTheDocument()
  })

  it('renders tag when provided', () => {
    const { getByText } = render(
      <ToolCard
        name="Test Tool"
        description="Test description"
        href="/test"
        icon={mockIcon}
        accent="bg-purple-500"
        tag="New"
      />
    )

    expect(getByText('New')).toBeInTheDocument()
  })

  it('does not render tag when not provided', () => {
    const { queryByText } = render(
      <ToolCard
        name="Test Tool"
        description="Test description"
        href="/test"
        icon={mockIcon}
        accent="bg-purple-500"
      />
    )

    expect(queryByText('New')).not.toBeInTheDocument()
  })

  it('renders launch text', () => {
    const { getByText } = render(
      <ToolCard
        name="Test Tool"
        description="Test description"
        href="/test"
        icon={mockIcon}
        accent="bg-purple-500"
      />
    )

    expect(getByText('Launch Tool →')).toBeInTheDocument()
  })

  it('applies accent class to icon container', () => {
    const { container } = render(
      <ToolCard
        name="Test Tool"
        description="Test description"
        href="/test"
        icon={mockIcon}
        accent="bg-red-600"
      />
    )

    const iconContainer = container.querySelector('.bg-red-600')
    expect(iconContainer).toBeInTheDocument()
  })
})
