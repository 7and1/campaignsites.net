import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase, ensureAnalyticsTables } from '@/lib/analytics'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'

const preferencesSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(32),
  preferences: z.object({
    weeklyDigest: z.boolean().optional(),
    toolTips: z.boolean().optional(),
    caseStudies: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
  }),
})

const getPreferencesSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(32),
})

/**
 * Get subscriber preferences
 */
async function handleGetPreferences(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') || ''
    const token = url.searchParams.get('token') || ''

    const validation = getPreferencesSchema.safeParse({ email, token })
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    // Verify token
    const expectedToken = await generatePreferencesToken(email)
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    const { results } = await db
      .prepare(
        `SELECT email, name, status, preferences, created_at
         FROM newsletter_subscribers
         WHERE email = ?`
      )
      .bind(email)
      .all()

    const result = results[0]
    if (!result) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    const preferences = (result as { preferences: string | null }).preferences
      ? JSON.parse((result as { preferences: string }).preferences)
      : {
          weeklyDigest: true,
          toolTips: true,
          caseStudies: true,
          productUpdates: true,
        }

    return NextResponse.json({
      email: (result as { email: string }).email,
      name: (result as { name: string | null }).name,
      status: (result as { status: string }).status,
      preferences,
    })
  } catch (error) {
    logError('get-preferences', error)
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 })
  }
}

/**
 * Update subscriber preferences
 */
async function handleUpdatePreferences(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const validation = preferencesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, token, preferences } = validation.data

    // Verify token
    const expectedToken = await generatePreferencesToken(email)
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    await db
      .prepare(
        `UPDATE newsletter_subscribers
         SET preferences = ?, updated_at = datetime('now')
         WHERE email = ?`
      )
      .bind(JSON.stringify(preferences), email)
      .run()

    return NextResponse.json({
      ok: true,
      message: 'Preferences updated successfully',
      preferences,
    })
  } catch (error) {
    logError('update-preferences', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

/**
 * Generate secure preferences token
 */
async function generatePreferencesToken(email: string): Promise<string> {
  const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
  const encoder = new TextEncoder()
  const data = encoder.encode(`${email}:preferences:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const GET = withMonitoring(handleGetPreferences)
export const POST = withMonitoring(handleUpdatePreferences)
