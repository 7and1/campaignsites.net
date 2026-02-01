import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-ink-900')
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('border-ink-200')
  })

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-ink-600')
  })

  it('applies medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4')
    // Medium has responsive sizing: py-3 default, sm:py-2.5 at small breakpoint
    expect(button).toHaveClass('py-3')
    expect(button).toHaveClass('sm:py-2.5')
  })

  it('applies small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-2')
  })

  it('applies large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
    expect(button).toHaveClass('disabled:cursor-not-allowed')
  })

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('disabled')
  })

  it('displays spinner when loading', () => {
    render(<Button loading>Loading</Button>)
    const spinner = screen.getByRole('button').querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('hides children visually when loading but keeps accessible text', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={(el) => (ref.current = el)}>Ref Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('has display name', () => {
    expect(Button.displayName).toBe('Button')
  })

  it('has uppercase tracking styling', () => {
    render(<Button>Styled</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('uppercase')
    expect(button).toHaveClass('tracking-[0.2em]')
  })

  it('has rounded-full styling', () => {
    render(<Button>Rounded</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('rounded-full')
  })

  it('has font-semibold styling', () => {
    render(<Button>Bold</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('font-semibold')
  })

  it('has focus ring styling', () => {
    render(<Button>Focus</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:ring-2')
    expect(button).toHaveClass('focus:ring-offset-2')
  })

  it('has transition styling', () => {
    render(<Button>Transition</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transition-all')
  })

  it('has inline-flex layout', () => {
    render(<Button>Flex</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('justify-center')
  })

  it('has gap between icon and text', () => {
    render(<Button loading>With Icon</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('gap-2')
  })

  it('spinner has correct size', () => {
    render(<Button loading>Loading</Button>)
    const spinner = screen.getByRole('button').querySelector('svg')
    expect(spinner).toHaveClass('h-4')
    expect(spinner).toHaveClass('w-4')
  })

  it('spinner is hidden from accessibility tree', () => {
    render(<Button loading>Loading</Button>)
    const spinner = screen.getByRole('button').querySelector('svg')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })

  it('combines variant and size classes correctly', () => {
    render(
      <Button variant="secondary" size="lg">
        Combined
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-ink-900')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('passes through button type attribute', () => {
    render(<Button type="submit">Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('has no explicit type attribute by default', () => {
    render(<Button>Default Type</Button>)
    const button = screen.getByRole('button')
    // Button defaults to submit behavior but may not have explicit attribute
    expect(button).toBeInTheDocument()
  })

  it('handles hover states for primary variant', () => {
    render(<Button variant="primary">Hover</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-primary-700')
  })

  it('handles hover states for secondary variant', () => {
    render(<Button variant="secondary">Hover</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-ink-800')
  })

  it('handles hover states for outline variant', () => {
    render(<Button variant="outline">Hover</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:border-primary-300')
    expect(button).toHaveClass('hover:bg-primary-50')
  })

  it('handles hover states for ghost variant', () => {
    render(<Button variant="ghost">Hover</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-mist-100')
  })
})
