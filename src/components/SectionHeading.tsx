import { memo } from 'react'

interface SectionHeadingProps {
  kicker?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export const SectionHeading = memo(function SectionHeading({ kicker, title, description, align = 'left' }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className="section-title mt-3">{title}</h2>
      {description && <p className="mt-3 text-base text-ink-600">{description}</p>}
    </div>
  )
})
