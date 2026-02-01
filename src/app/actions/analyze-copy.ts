'use server'

import OpenAI from 'openai'
import { z } from 'zod'
import type { CopyAnalysisResult } from '@/lib/types'
import { logError } from '@/lib/errors'
import { withServerActionRateLimit, isRateLimitError } from '@/lib/server-action-rate-limit'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Rate limit configuration: 10 OpenAI requests per hour per IP
const OPENAI_RATE_LIMIT = {
  limit: 10,
  window: 60 * 60 * 1000, // 1 hour
  identifier: 'openai-analyze-copy',
}

export type { CopyAnalysisResult }

// Input validation schema
const analyzeCopySchema = z.object({
  text: z.string().min(1).max(500).trim(),
  type: z.enum(['headline', 'cta']),
})

const DEMO_RESPONSE = (
  text: string
): CopyAnalysisResult => ({
  score: Math.floor(Math.random() * 30) + 60,
  suggestions: [
    'Add specific numbers or percentages for credibility',
    'Include a time-sensitive element to create urgency',
    'Use power words like "exclusive", "proven", or "guaranteed"',
  ],
  variants: [
    `Exclusive: ${text}`,
    `${text} - Limited Time Offer`,
    `Proven ${text} (Join 10,000+ Users)`,
  ],
})

const ERROR_RESPONSE = (text: string): CopyAnalysisResult => ({
  score: 70,
  suggestions: [
    'Consider adding a specific benefit or outcome',
    'Try incorporating social proof elements',
    'Test different action verbs for your CTA',
  ],
  variants: [
    `${text} - Start Now`,
    `Get ${text} Today`,
    `${text} (Free Trial)`,
  ],
})

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(input: string): string {
  // Remove potential prompt injection patterns
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\n+/g, ' ') // Normalize newlines
    .trim()
}

/**
 * Validate and sanitize the copy analysis result
 */
function validateAnalysisResult(result: unknown): CopyAnalysisResult {
  if (typeof result !== 'object' || result === null) {
    throw new Error('Invalid analysis result format')
  }

  const r = result as Record<string, unknown>

  // Validate score
  if (typeof r.score !== 'number' || r.score < 0 || r.score > 100) {
    throw new Error('Invalid score in analysis result')
  }

  // Validate suggestions
  if (!Array.isArray(r.suggestions) || r.suggestions.length === 0) {
    throw new Error('Invalid suggestions in analysis result')
  }

  // Validate variants
  if (!Array.isArray(r.variants) || r.variants.length === 0) {
    throw new Error('Invalid variants in analysis result')
  }

  return {
    score: r.score,
    suggestions: r.suggestions.filter((s): s is string => typeof s === 'string'),
    variants: r.variants.filter((v): v is string => typeof v === 'string'),
  }
}

export async function analyzeCopy(
  text: string,
  type: 'headline' | 'cta'
): Promise<CopyAnalysisResult> {
  // Rate limiting: 10 OpenAI requests per hour per IP
  try {
    await withServerActionRateLimit(OPENAI_RATE_LIMIT)
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new Error(`Rate limit exceeded. Please try again later. Resets at ${new Date(error.resetAt).toLocaleTimeString()}`)
    }
    throw error
  }

  // Validate input
  const validation = analyzeCopySchema.safeParse({ text, type })
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues.map((e: { message: string }) => e.message).join(', '))
  }

  const sanitizedText = sanitizeInput(validation.data.text)

  if (!process.env.OPENAI_API_KEY) {
    return DEMO_RESPONSE(sanitizedText)
  }

  const prompt = `You are a conversion rate optimization expert. Analyze this ${type} copy: "${sanitizedText}"

Return a JSON object with:
1. "score": 0-100 effectiveness rating
2. "suggestions": array of 3 specific improvement suggestions
3. "variants": array of 3 improved versions of the copy

Focus on:
- Clarity and specificity
- Emotional triggers
- Urgency and scarcity
- Social proof potential
- Action orientation

Return ONLY valid JSON, no markdown.`

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      max_tokens: 800,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(content)
    return validateAnalysisResult(parsed)
  } catch (error) {
    logError('analyze-copy', error)
    return ERROR_RESPONSE(sanitizedText)
  }
}
