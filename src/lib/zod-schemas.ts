/**
 * Zod validation schemas for API routes
 * Provides runtime validation with type safety
 */

import { z } from 'zod'

/**
 * Strict email validation
 * Uses a more comprehensive regex following RFC 5322 with practical restrictions
 */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .regex(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    'Invalid email format'
  )
  .refine(
    (email) => !email.includes('..') && !email.startsWith('.') && !email.endsWith('.'),
    'Invalid email format'
  )
  .refine(
    (email) => !/<script/i.test(email) && !/javascript:/i.test(email),
    'Invalid email format'
  )

/**
 * URL validation for UTM parameters and other URLs
 * Rejects javascript: and other dangerous protocols
 */
const safeUrlSchema = z
  .string()
  .trim()
  .max(2048, 'URL is too long')
  .optional()
  .nullable()
  .transform((val) => {
    if (!val) return null
    const sanitized = val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
    if (!sanitized) return null
    const lower = sanitized.toLowerCase()
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:')
    ) {
      return null
    }
    return sanitized
  })

/**
 * UTM parameters validation
 */
const utmSchema = z.object({
  utm_source: z.string().trim().max(100).optional().nullable(),
  utm_medium: z.string().trim().max(100).optional().nullable(),
  utm_campaign: z.string().trim().max(100).optional().nullable(),
  utm_term: z.string().trim().max(100).optional().nullable(),
  utm_content: z.string().trim().max(100).optional().nullable(),
})

/**
 * Sanitize string input - removes HTML tags and dangerous characters
 */
const createSanitizeStringSchema = (maxLength = 5000) =>
  z
    .string()
    .max(maxLength, `Input exceeds maximum length of ${maxLength} characters`)
    .transform((val) => {
      // Remove potential HTML/script tags
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^>]*>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/\son\w+\s*=/gi, '') // Remove event handlers like onclick=
        .replace(/\s+/g, ' ')
        .trim()
    })

/**
 * Name validation
 */
const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z0-9\s\-'\.]+$/, 'Name contains invalid characters')

/**
 * Message/comment content validation
 */
const messageSchema = createSanitizeStringSchema(5000).refine(
  (val) => val.length >= 1,
  'Message is required'
)

/**
 * Subscribe request schema
 */
export const subscribeSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(100).optional(),
  leadMagnet: z.enum(['landing-page-checklist', 'utm-naming-guide', 'cta-swipe-file']).optional(),
  source: z.string().trim().max(50).optional(),
})

/**
 * Contact request schema
 */
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  topic: createSanitizeStringSchema(200).optional(),
  message: messageSchema,
})

/**
 * Track event schema
 */
export const trackSchema = z.object({
  eventType: z.string().trim().min(1).max(50).refine(val => !/javascript:|<script/i.test(val)),
  toolSlug: z.string().trim().max(100).optional(),
  context: z.string().trim().max(100).optional(),
  url: safeUrlSchema,
  utm: utmSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Upvote schema
 */
export const upvoteSchema = z.object({
  contentType: z.enum(['blog', 'gallery', 'tools'], {
    message: 'Invalid content type',
  }),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
})

/**
 * Case study submission schema
 */
export const caseStudySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  brand: z
    .string()
    .trim()
    .min(1, 'Brand is required')
    .max(100, 'Brand is too long'),
  category: z.string().trim().max(50).optional(),
  url: safeUrlSchema,
  summary: createSanitizeStringSchema(2000).optional(),
  metrics: createSanitizeStringSchema(500).optional(),
  tools: createSanitizeStringSchema(500).optional(),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type TrackInput = z.infer<typeof trackSchema>
export type UpvoteInput = z.infer<typeof upvoteSchema>
export type CaseStudyInput = z.infer<typeof caseStudySchema>
