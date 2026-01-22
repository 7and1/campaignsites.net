import { describe, it, expect } from 'vitest'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

describe('cn utility', () => {
  it('merges classes correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class', false && 'removed-class')).toBe(
      'base-class conditional-class'
    )
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('', null, undefined)).toBe('')
  })

  it('handles arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('handles objects', () => {
    expect(cn({ 'class-a': true, 'class-b': false, 'class-c': true })).toBe('class-a class-c')
  })

  it('combines different input types', () => {
    expect(cn('base', ['array-class'], { 'obj-class': true }, 'final')).toBe(
      'base array-class obj-class final'
    )
  })

  it('merges responsive classes correctly', () => {
    expect(cn('px-2 md:px-4', 'md:px-6')).toBe('px-2 md:px-6')
  })

  it('handles state variant classes', () => {
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500')
  })

  it('handles arbitrary values', () => {
    expect(cn('[color:red]', '[color:blue]')).toBe('[color:blue]')
  })
})
