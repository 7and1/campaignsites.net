'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, FileText, Image as ImageIcon, Wrench, File } from 'lucide-react'
import Link from 'next/link'
import { getSearchData, type SearchItem } from '@/app/actions/search'

// Simple fuzzy search implementation
function fuzzyMatch(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // Exact match gets highest score
  if (textLower === queryLower) return 100

  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 90

  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 70

  // Fuzzy match - check if all query characters appear in order
  let queryIndex = 0
  let matchCount = 0

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matchCount++
      queryIndex++
    }
  }

  if (queryIndex === queryLower.length) {
    // All characters matched, score based on how close together they were
    return Math.max(30, 60 - (textLower.length - queryLower.length))
  }

  return 0
}

function searchItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) return []

  const scored = items
    .map((item) => {
      // Search in title, description, category, and tags
      const titleScore = fuzzyMatch(item.title, query) * 3 // Title matches are most important
      const descScore = fuzzyMatch(item.description, query)
      const categoryScore = item.category ? fuzzyMatch(item.category, query) * 2 : 0
      const tagsScore = item.tags
        ? Math.max(...item.tags.map((tag) => fuzzyMatch(tag, query))) * 1.5
        : 0

      const totalScore = titleScore + descScore + categoryScore + tagsScore

      return { item, score: totalScore }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 8).map((result) => result.item)
}

const typeIcons = {
  tool: Wrench,
  post: FileText,
  'case-study': ImageIcon,
  page: File,
}

const typeLabels = {
  tool: 'Tool',
  post: 'Blog Post',
  'case-study': 'Case Study',
  page: 'Page',
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Load search data when modal opens
  useEffect(() => {
    if (isOpen && allItems.length === 0) {
      setIsLoading(true)
      getSearchData()
        .then((data) => {
          setAllItems(data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, allItems.length])

  // Perform search
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchItems(allItems, query)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
      setSelectedIndex(0)
    }
  }, [query, allItems])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }

      // Arrow navigation
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault()
          window.location.href = results[selectedIndex].href
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults([])
  }, [])

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-ink-600 transition hover:bg-white hover:shadow-sm"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded bg-mist-100 px-1.5 py-0.5 text-xs text-ink-500 sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/50 p-4 pt-[10vh] backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <Search className="h-5 w-5 text-ink-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, guides, case studies..."
                className="flex-1 bg-transparent text-ink-900 placeholder-ink-400 outline-none"
                aria-label="Search input"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="rounded-full p-1 text-ink-400 hover:bg-mist-100 hover:text-ink-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-ink-400 hover:bg-mist-100 hover:text-ink-600"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-ink-500">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                  <p className="mt-3 text-sm">Loading search index...</p>
                </div>
              ) : query.trim() && results.length === 0 ? (
                <div className="p-8 text-center text-ink-500">
                  <Search className="mx-auto h-12 w-12 text-ink-300" />
                  <p className="mt-3 text-sm">No results found for &quot;{query}&quot;</p>
                  <p className="mt-1 text-xs">Try different keywords or browse our content</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((item, index) => {
                    const Icon = typeIcons[item.type]
                    const isSelected = index === selectedIndex

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleClose}
                        className={`flex items-start gap-3 px-4 py-3 transition ${
                          isSelected
                            ? 'bg-primary-50 text-primary-900'
                            : 'text-ink-900 hover:bg-mist-50'
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-primary-100' : 'bg-mist-100'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? 'text-primary-600' : 'text-ink-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                                isSelected
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-mist-100 text-ink-600'
                              }`}
                            >
                              {typeLabels[item.type]}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-0.5 text-sm text-ink-600 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {item.category && (
                            <p className="mt-1 text-xs text-ink-500">{item.category}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-ink-500">
                  <Search className="mx-auto h-12 w-12 text-ink-300" />
                  <p className="mt-3 text-sm">Start typing to search</p>
                  <p className="mt-1 text-xs">Search across tools, guides, and case studies</p>
                </div>
              )}
            </div>

            {/* Footer with keyboard shortcuts */}
            <div className="flex items-center justify-between border-t border-ink-100 bg-mist-50 px-4 py-2 text-xs text-ink-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white px-1.5 py-0.5">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white px-1.5 py-0.5">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white px-1.5 py-0.5">ESC</kbd> Close
                </span>
              </div>
              <span>{results.length > 0 && `${results.length} results`}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
