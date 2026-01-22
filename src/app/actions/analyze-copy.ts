'use server'

import OpenAI from 'openai'
import type { CopyAnalysisResult } from '@/lib/types'
import { logError } from '@/lib/errors'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type { CopyAnalysisResult }

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

export async function analyzeCopy(text: string, type: 'headline' | 'cta'): Promise<CopyAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return DEMO_RESPONSE(text)
  }

  const prompt = `You are a conversion rate optimization expert. Analyze this ${type} copy: "${text}"

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
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content) as CopyAnalysisResult
  } catch (error) {
    logError('analyze-copy', error)
    return ERROR_RESPONSE(text)
  }
}
