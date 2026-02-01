import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'
import { subscribeSchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { LEAD_MAGNET_LINKS } from '@/lib/constants'
import { logError } from '@/lib/errors'
import {
  getWelcomeEmailSubject,
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  getToolTipBySlug,
  getToolTipEmailSubject,
  getToolTipEmailHtml,
  getToolTipEmailText,
} from '@/lib/email/templates'
import { queueEmail } from '@/lib/email/queue'
import { withMonitoring } from '@/lib/monitoring'
import {
  generateUnsubscribeLink,
  generatePreferencesLink,
  generateListUnsubscribeHeader,
  generateListUnsubscribePostHeader,
} from '@/lib/email/unsubscribe'

async function handler(request: Request) {
  try {
    // Rate limiting: 5 requests per hour per IP
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

    // Send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const downloadLink = LEAD_MAGNET_LINKS[leadMagnet || 'landing-page-checklist']
      const leadMagnetTitles: Record<string, string> = {
        'landing-page-checklist': 'Landing Page Launch Checklist',
        'utm-naming-guide': 'UTM Naming Convention Guide',
        'cta-swipe-file': 'High-Intent CTA Swipe File',
      }

      // Generate unsubscribe and preferences links
      const unsubscribeUrl = await generateUnsubscribeLink(email)
      const preferencesUrl = await generatePreferencesLink(email)

      const emailData = {
        name: name || undefined,
        leadMagnetTitle: leadMagnetTitles[leadMagnet || 'landing-page-checklist'],
        leadMagnetUrl: downloadLink,
        unsubscribeUrl,
        preferencesUrl,
      }

      const from = process.env.RESEND_FROM || 'CampaignSites <hello@campaignsites.net>'

      // Generate List-Unsubscribe headers (RFC 8058)
      const listUnsubscribe = await generateListUnsubscribeHeader(email)
      const listUnsubscribePost = generateListUnsubscribePostHeader()

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: getWelcomeEmailSubject(emailData),
          html: getWelcomeEmailHtml(emailData),
          text: getWelcomeEmailText(emailData),
          headers: {
            'List-Unsubscribe': listUnsubscribe,
            'List-Unsubscribe-Post': listUnsubscribePost,
          },
        }),
      })

      // Queue follow-up tool tip emails for drip campaign
      const tip1 = getToolTipBySlug('utm-builder', 1)
      if (tip1) {
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + 2)

        await queueEmail({
          to: email,
          from,
          subject: getToolTipEmailSubject(tip1),
          html: getToolTipEmailHtml({ ...tip1, name: name || undefined }),
          text: getToolTipEmailText({ ...tip1, name: name || undefined }),
          scheduledAt: scheduledDate,
          status: 'pending',
          templateId: 'tool-tip-utm-1',
          metadata: { subscriberEmail: email, tipNumber: 1, toolSlug: 'utm-builder' },
        })
      }
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

export const POST = withMonitoring(handler)
