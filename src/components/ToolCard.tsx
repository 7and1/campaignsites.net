import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { memo } from 'react'

interface ToolCardProps {
  name: string
  description: string
  href: string
  icon: LucideIcon
  accent: string
  tag?: string
}

export const ToolCard = memo(function ToolCard({ name, description, href, icon: Icon, accent, tag }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
    >
      <div className={`inline-flex rounded-2xl p-3 text-white ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <h3 className="text-lg font-semibold text-ink-900 group-hover:text-primary-600">{name}</h3>
        {tag && (
          <span className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-600">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-600">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
        Launch Tool →
      </div>
    </Link>
  )
})
