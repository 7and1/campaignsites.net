import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'

interface AffiliateDisclosureProps {
  compact?: boolean
}

export const AffiliateDisclosure = memo(function AffiliateDisclosure({
  compact = false,
}: AffiliateDisclosureProps) {
  if (compact) {
    return (
      <p className="text-xs text-ink-500">
        Contains affiliate links. We may earn a commission at no extra cost to you.
      </p>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Disclosure:</strong> This content contains affiliate links. We may earn a
          commission at no extra cost to you if you make a purchase.
        </span>
      </span>
    </div>
  )
})
