import { memo } from 'react'

interface RichTextContentProps {
  html: string
  className?: string
}

/**
 * RichTextContent provides consistent styling for rendered HTML content
 * from PayloadCMS Lexical editor. Includes proper typography, code blocks,
 * and responsive spacing.
 */
export const RichTextContent = memo(function RichTextContent({
  html,
  className = '',
}: RichTextContentProps) {
  return (
    <div
      className={`prose prose-slate max-w-none text-ink-700 prose-headings:scroll-mt-28 prose-headings:text-ink-900 prose-headings:font-semibold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-ink-900 prose-code:text-ink-900 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:rounded-md prose-code:bg-mist-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-4 prose-blockquote:border-primary-200 prose-blockquote:bg-primary-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-primary-900 prose-hr:border-mist-200 prose-img:rounded-2xl prose-img:border prose-img:border-white/70 prose-figure:my-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})
