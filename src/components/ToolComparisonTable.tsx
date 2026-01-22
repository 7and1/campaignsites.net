import { Star } from 'lucide-react'
import { AffiliateCTA } from '@/components/AffiliateCTA'
import type { Tool } from '@/lib/types'
import { memo } from 'react'

interface ToolComparisonTableProps {
  tools: Tool[]
  title?: string
  context?: string
}

export const ToolComparisonTable = memo(function ToolComparisonTable({ tools, title, context = 'comparison-table' }: ToolComparisonTableProps) {
  if (!tools?.length) return null

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-ink-900">{title || 'Tool comparison'}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.2em] text-ink-500">
            <tr>
              <th className="pb-3">Tool</th>
              <th className="pb-3">Pricing</th>
              <th className="pb-3">Rating</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="text-ink-700">
            {tools.map((tool) => (
              <tr key={tool.id || tool.slug} className="border-t border-mist-200">
                <td className="py-4 font-semibold text-ink-900">{tool.name}</td>
                <td className="py-4">{tool.pricing || 'See pricing'}</td>
                <td className="py-4">
                  {tool.rating ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                      <Star className="h-3.5 w-3.5" /> {tool.rating}/5
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-4 text-right">
                  <AffiliateCTA
                    href={tool.affiliateUrl || undefined}
                    toolSlug={tool.slug}
                    context={context}
                    className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
                  >
                    Try now
                  </AffiliateCTA>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
