'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  const pages = []
  const showEllipsisStart = currentPage > 3
  const showEllipsisEnd = currentPage < totalPages - 2

  // Always show first page
  pages.push(1)

  // Show ellipsis or pages near start
  if (showEllipsisStart) {
    pages.push(-1) // -1 represents ellipsis
  } else {
    for (let i = 2; i < Math.min(currentPage, 4); i++) {
      pages.push(i)
    }
  }

  // Show current page and neighbors
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }

  // Show ellipsis or pages near end
  if (showEllipsisEnd) {
    pages.push(-2) // -2 represents ellipsis
  } else {
    for (let i = Math.max(currentPage + 2, totalPages - 2); i < totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
  }

  // Always show last page
  if (!pages.includes(totalPages)) {
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-primary-300 hover:bg-white"
          aria-label="Previous page"
          rel="prev"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-400 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === -1 || page === -2) {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-ink-400">
                ...
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'border border-ink-200 bg-white/70 text-ink-700 hover:border-primary-300 hover:bg-white'
              }`}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        })}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-primary-300 hover:bg-white"
          aria-label="Next page"
          rel="next"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-400 cursor-not-allowed">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
