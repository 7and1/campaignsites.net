'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-ink-500 transition hover:text-primary-600"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-ink-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-ink-500 transition hover:text-primary-600"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Helper to generate breadcrumbs for tool pages
export function ToolBreadcrumbs({ toolName }: { toolName: string }) {
  return (
    <Breadcrumbs
      items={[
        { label: 'Tools', href: '/tools' },
        { label: toolName },
      ]}
    />
  )
}
