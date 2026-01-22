import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'
import { caseStudySchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '@/lib/rate-limit'
import { logError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 submissions per day per IP
    await ensureRateLimitTable()
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, {
      limit: 3,
      window: 24 * 60 * 60 * 1000, // 24 hours
      identifier: 'submit',
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submission attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validationResult = caseStudySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, brand, category, url, summary, metrics, tools } = validationResult.data

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    await db
      .prepare(
        `INSERT INTO case_study_submissions (name, email, brand, category, url, summary, metrics, tools)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(name, email, brand, category || null, url || null, summary || null, metrics || null, tools || null)
      .run()

    return NextResponse.json({
      ok: true,
      message: 'Submission received. We will review shortly.',
    })
  } catch (error) {
    logError('submit', error)
    return NextResponse.json({ error: 'Failed to submit case study' }, { status: 500 })
  }
}
