import { memo } from 'react'
import { Lightbulb } from 'lucide-react'

export interface Takeaway {
  point?: string | null
  id?: string | null
}

interface KeyTakeawaysProps {
  takeaways?: Takeaway[] | null
  title?: string
}

export const KeyTakeaways = memo(function KeyTakeaways({
  takeaways,
  title = 'Key takeaways',
}: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-900">
        <Lightbulb className="h-5 w-5 text-amber-600" />
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={takeaway?.id || index} className="flex items-start gap-3 text-sm text-amber-800">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold text-amber-800">
              {index + 1}
            </span>
            <span>{takeaway?.point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
