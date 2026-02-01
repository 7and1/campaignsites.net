'use server'

import OpenAI from 'openai'
import { z } from 'zod'
import { withServerActionRateLimit, isRateLimitError } from '@/lib/server-action-rate-limit'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Rate limit configuration: 10 OpenAI requests per hour per IP
const OPENAI_RATE_LIMIT = {
  limit: 10,
  window: 60 * 60 * 1000, // 1 hour
  identifier: 'openai-ai-lab',
}

// Input validation schemas
const generateCampaignNamesSchema = z.object({
  offer: z.string().min(1).max(200).trim(),
  audience: z.string().min(1).max(200).trim(),
  tone: z.string().min(1).max(100).trim(),
})

const analyzeLandingPageStructureSchema = z.object({
  goal: z.string().min(1).max(500).trim(),
  audience: z.string().min(1).max(300).trim(),
  structure: z.string().min(1).max(2000).trim(),
})

const generateAbTestIdeasSchema = z.object({
  offer: z.string().min(1).max(200).trim(),
  audience: z.string().min(1).max(200).trim(),
  goal: z.string().min(1).max(300).trim(),
})

export interface CampaignNameResult {
  names: string[]
}

export interface StructureAnalysisResult {
  score: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

export interface AbTestIdeasResult {
  ideas: string[]
}

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

export async function generateCampaignNames(input: {
  offer: string
  audience: string
  tone: string
}): Promise<CampaignNameResult> {
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
  const validation = generateCampaignNamesSchema.safeParse(input)
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues.map((e: { message: string }) => e.message).join(', '))
  }

  const { offer, audience, tone } = validation.data

  if (!process.env.OPENAI_API_KEY) {
    return {
      names: [
        `${sanitizeInput(offer)} Sprint`,
        `${sanitizeInput(audience)} Launch Kit`,
        `Fast-track ${sanitizeInput(offer)}`,
        `The ${sanitizeInput(offer)} Advantage`,
        `${sanitizeInput(offer)} Momentum`,
      ],
    }
  }

  const prompt = `Generate 6 campaign name ideas.
Offer: ${sanitizeInput(offer)}
Audience: ${sanitizeInput(audience)}
Tone: ${sanitizeInput(tone)}
Return JSON: {"names": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  // Validate response structure
  const parsed = JSON.parse(content) as CampaignNameResult
  if (!Array.isArray(parsed.names)) {
    throw new Error('Invalid response format from AI')
  }

  return parsed
}

export async function analyzeLandingPageStructure(input: {
  goal: string
  audience: string
  structure: string
}): Promise<StructureAnalysisResult> {
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
  const validation = analyzeLandingPageStructureSchema.safeParse(input)
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues.map((e: { message: string }) => e.message).join(', '))
  }

  const { goal, audience, structure } = validation.data

  if (!process.env.OPENAI_API_KEY) {
    return {
      score: 72,
      strengths: ['Clear headline and CTA placement', 'Logical flow from problem to solution'],
      gaps: ['Missing social proof above the fold', 'No FAQ section to reduce objections'],
      recommendations: [
        'Add two proof points near the hero CTA.',
        'Include an FAQ section addressing pricing and implementation.',
        'Tighten the benefit stack to 3 bullets for scanability.',
      ],
    }
  }

  const prompt = `You are a conversion rate optimization strategist.
Goal: ${sanitizeInput(goal)}
Audience: ${sanitizeInput(audience)}
Landing page structure: ${sanitizeInput(structure)}
Return JSON with: {"score": number (0-100), "strengths": ["..."], "gaps": ["..."], "recommendations": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  // Validate response structure
  const parsed = JSON.parse(content) as StructureAnalysisResult
  if (typeof parsed.score !== 'number' || !Array.isArray(parsed.strengths)) {
    throw new Error('Invalid response format from AI')
  }

  return parsed
}

export async function generateAbTestIdeas(input: {
  offer: string
  audience: string
  goal: string
}): Promise<AbTestIdeasResult> {
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
  const validation = generateAbTestIdeasSchema.safeParse(input)
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues.map((e: { message: string }) => e.message).join(', '))
  }

  const { offer, audience, goal } = validation.data

  if (!process.env.OPENAI_API_KEY) {
    return {
      ideas: [
        'Swap headline from benefit-first to outcome-first to test clarity.',
        'Test CTA button copy: "Start free" vs "Get the plan".',
        'Move testimonial block above pricing section.',
        'Test shorter form (2 fields) vs longer form (5 fields).',
        'Swap hero visual from product UI to customer photo.',
      ],
    }
  }

  const prompt = `Generate 5 A/B test ideas for this campaign.
Offer: ${sanitizeInput(offer)}
Audience: ${sanitizeInput(audience)}
Goal: ${sanitizeInput(goal)}
Return JSON: {"ideas": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  // Validate response structure
  const parsed = JSON.parse(content) as AbTestIdeasResult
  if (!Array.isArray(parsed.ideas)) {
    throw new Error('Invalid response format from AI')
  }

  return parsed
}
