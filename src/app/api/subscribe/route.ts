import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'
import { subscribeSchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '@/lib/rate-limit'
import { LEAD_MAGNET_LINKS } from '@/lib/constants'
import { logError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 requests per hour per IP
    await ensureRateLimitTable()
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, {
      limit: 5,
      window: 60 * 60 * 1000, // 1 hour
      identifier: 'subscribe',
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
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
    const validationResult = subscribeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, name, leadMagnet, source } = validationResult.data

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    await db
      .prepare(
        `INSERT INTO newsletter_subscribers (email, name, lead_magnet, source, status)
         VALUES (?, ?, ?, ?, 'active')
         ON CONFLICT(email) DO UPDATE SET name = excluded.name, lead_magnet = excluded.lead_magnet, source = excluded.source, status = 'active'`
      )
      .bind(email, name || null, leadMagnet || 'landing-page-checklist', source || 'site')
      .run()

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const downloadLink = LEAD_MAGNET_LINKS[leadMagnet || 'landing-page-checklist']
      const from = process.env.RESEND_FROM || 'CampaignSites <hello@campaignsites.net>'
      const subject = 'Your CampaignSites resource pack'
      const html = `
        <div style="font-family:Arial, sans-serif;">
          <h2>Here's your resource pack</h2>
          <p>Thanks for subscribing! Download your resource here:</p>
          <p><a href="${downloadLink}">${downloadLink}</a></p>
          <p>You'll also receive our weekly campaign teardown every Friday.</p>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject,
          html,
        }),
      })
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'You are subscribed. Check your inbox for the download link.',
      },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        },
      }
    )
  } catch (error) {
    logError('subscribe', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
