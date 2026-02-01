import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase, ensureAnalyticsTables } from '@/lib/analytics'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(32).optional(),
  reason: z.enum(['too-frequent', 'not-relevant', 'never-subscribed', 'other']).optional(),
  feedback: z.string().max(500).optional(),
})

/**
 * One-click unsubscribe endpoint (RFC 8058)
 * Supports both POST with token and GET with email+token
 */
async function handleUnsubscribe(request: Request) {
  try {
    const url = new URL(request.url)
    let email: string
    let token: string | undefined
    let reason: string | undefined
    let feedback: string | undefined

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const validation = unsubscribeSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0]?.message || 'Invalid input' },
          { status: 400 }
        )
      }

      email = validation.data.email
      token = validation.data.token
      reason = validation.data.reason
      feedback = validation.data.feedback
    } else {
      // GET request for one-click unsubscribe
      email = url.searchParams.get('email') || ''
      token = url.searchParams.get('token') || undefined

      if (!email || !z.string().email().safeParse(email).success) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
    }

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    // Verify token if provided (for security)
    if (token) {
      const expectedToken = await generateUnsubscribeToken(email)
      if (token !== expectedToken) {
        return NextResponse.json({ error: 'Invalid unsubscribe token' }, { status: 403 })
      }
    }

    // Update subscriber status to unsubscribed
    await db
      .prepare(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed',
             unsubscribed_at = datetime('now'),
             unsubscribe_reason = ?,
             unsubscribe_feedback = ?
         WHERE email = ?`
      )
      .bind(reason || null, feedback || null, email)
      .run()

    // Log unsubscribe event
    await db
      .prepare(
        `INSERT INTO analytics_events (event_type, context, metadata, created_at)
         VALUES ('unsubscribe', 'email', ?, datetime('now'))`
      )
      .bind(JSON.stringify({ email, reason, feedback }))
      .run()

    return NextResponse.json({
      ok: true,
      message: 'You have been unsubscribed successfully.',
    })
  } catch (error) {
    logError('unsubscribe', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}

/**
 * Generate secure unsubscribe token
 */
async function generateUnsubscribeToken(email: string): Promise<string> {
  const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
  const encoder = new TextEncoder()
  const data = encoder.encode(`${email}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const POST = withMonitoring(handleUnsubscribe)
export const GET = withMonitoring(handleUnsubscribe)
