import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'
import { contactSchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '@/lib/rate-limit'
import { logError } from '@/lib/errors'
import { escapeHtml } from '@/lib/sanitization'
import { withMonitoring } from '@/lib/monitoring'

async function handler(request: Request) {
  try {
    // Rate limiting: 3 requests per hour per IP
    await ensureRateLimitTable()
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, {
      limit: 3,
      window: 60 * 60 * 1000, // 1 hour
      identifier: 'contact',
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many contact attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validationResult = contactSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, topic, message } = validationResult.data

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    await db
      .prepare(
        `INSERT INTO contact_messages (name, email, topic, message)
         VALUES (?, ?, ?, ?)`
      )
      .bind(name, email, topic || null, message)
      .run()

    const resendKey = process.env.RESEND_API_KEY
    const contactTo = process.env.CONTACT_TO || 'hello@campaignsites.net'

    if (resendKey) {
      const sanitizedMessage = escapeHtml(message).replace(/\n/g, '<br/>')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'CampaignSites <hello@campaignsites.net>',
          to: [contactTo],
          subject: `New contact form message: ${topic || 'General'}`,
          html: `
            <div style="font-family:Arial, sans-serif;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Topic:</strong> ${topic || 'General'}</p>
              <p><strong>Message:</strong></p>
              <p>${sanitizedMessage}</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json(
      { ok: true, message: 'Thanks! We will reply within 48 hours.' },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        },
      }
    )
  } catch (error) {
    logError('contact', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export const POST = withMonitoring(handler)
