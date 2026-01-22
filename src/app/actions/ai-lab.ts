'use server'

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

export async function generateCampaignNames(input: {
  offer: string
  audience: string
  tone: string
}): Promise<CampaignNameResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      names: [
        `${input.offer} Sprint`,
        `${input.audience} Launch Kit`,
        `Fast-track ${input.offer}`,
        `The ${input.offer} Advantage`,
        `${input.offer} Momentum`,
      ],
    }
  }

  const prompt = `Generate 6 campaign name ideas.
Offer: ${input.offer}
Audience: ${input.audience}
Tone: ${input.tone}
Return JSON: {"names": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content) as CampaignNameResult
}

export async function analyzeLandingPageStructure(input: {
  goal: string
  audience: string
  structure: string
}): Promise<StructureAnalysisResult> {
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
Goal: ${input.goal}
Audience: ${input.audience}
Landing page structure: ${input.structure}
Return JSON with: {"score": number (0-100), "strengths": ["..."], "gaps": ["..."], "recommendations": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content) as StructureAnalysisResult
}

export async function generateAbTestIdeas(input: {
  offer: string
  audience: string
  goal: string
}): Promise<AbTestIdeasResult> {
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
Offer: ${input.offer}
Audience: ${input.audience}
Goal: ${input.goal}
Return JSON: {"ideas": ["..."]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content) as AbTestIdeasResult
}
