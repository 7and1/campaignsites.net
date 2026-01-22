import type { HeadingItem } from '@/lib/richtext'
import { memo } from 'react'

interface TableOfContentsProps {
  headings: HeadingItem[]
}

export const TableOfContents = memo(function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings.length) return null

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">On this page</p>
      <ul className="mt-4 space-y-2 text-sm text-ink-600">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level >= 3 ? 'pl-4' : 'pl-0'}>
            <a href={`#${heading.id}`} className="transition hover:text-primary-600">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
})
