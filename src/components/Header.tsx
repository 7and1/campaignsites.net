import Link from 'next/link'
import { memo } from 'react'
import { GlobalSearch } from './GlobalSearch'

const navigation = [
  { name: 'Tools', href: '/tools' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blog', href: '/blog' },
  { name: 'Resources', href: '/resources' },
  { name: 'Submit', href: '/submit' },
]

export const Header = memo(function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-ink-900">
          Campaign<span className="text-primary-600">Sites</span>
        </Link>

        <nav className="hidden md:flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 lg:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition hover:text-primary-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <GlobalSearch />
          <Link
            href="/resources"
            className="hidden items-center rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700 transition hover:border-primary-300 md:inline-flex"
          >
            Get checklist
          </Link>
        </div>
      </div>
    </header>
  )
})
