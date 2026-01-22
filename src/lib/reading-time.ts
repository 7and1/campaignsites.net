/**
 * Calculate estimated reading time for HTML content
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(html: string): number {
  if (!html) return 0

  // Strip HTML tags and get plain text
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return 0

  // Count words (split by spaces, filter empty strings)
  const wordCount = text.split(' ').filter((word) => word.length > 0).length

  // Calculate reading time (200 words per minute)
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)

  // Minimum 1 minute if there's content
  return Math.max(1, minutes)
}
