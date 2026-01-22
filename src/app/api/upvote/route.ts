import { NextResponse } from 'next/server'
import { ensureAnalyticsTables, getDatabase, hashIp } from '@/lib/analytics'
import { upvoteSchema } from '@/lib/zod-schemas'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '@/lib/rate-limit'
import { logError } from '@/lib/errors'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const slug = searchParams.get('slug')

    if (!contentType || !slug) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    const { results } = await db
      .prepare('SELECT COUNT(*) as count FROM upvotes WHERE content_type = ? AND slug = ?')
      .bind(contentType, slug)
      .all()

    return NextResponse.json({ count: results[0]?.count || 0 })
  } catch (error) {
    logError('upvote-get', error)
    return NextResponse.json({ error: 'Failed to load upvotes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting: 10 upvotes per minute per IP
    await ensureRateLimitTable()
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, {
      limit: 10,
      window: 60 * 1000, // 1 minute
      identifier: 'upvote',
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many upvote attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validationResult = upvoteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { contentType, slug } = validationResult.data

    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip')
    const ipHash = hashIp(ip)

    if (!ipHash) {
      return NextResponse.json({ error: 'Unable to identify voter' }, { status: 400 })
    }

    await db
      .prepare(
        `INSERT OR IGNORE INTO upvotes (content_type, slug, ip_hash)
         VALUES (?, ?, ?)`
      )
      .bind(contentType, slug, ipHash)
      .run()

    const { results } = await db
      .prepare('SELECT COUNT(*) as count FROM upvotes WHERE content_type = ? AND slug = ?')
      .bind(contentType, slug)
      .all()

    return NextResponse.json({ count: results[0]?.count || 0 })
  } catch (error) {
    logError('upvote-post', error)
    return NextResponse.json({ error: 'Failed to record upvote' }, { status: 500 })
  }
}
