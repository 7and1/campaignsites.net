import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'
import { getEmailAnalytics, getSubscriberEmailHistory, getTopClickedLinks } from '@/lib/email/analytics'

const analyticsQuerySchema = z.object({
  emailId: z.string().optional(),
  subscriberEmail: z.string().email().optional(),
  type: z.enum(['email', 'subscriber', 'links']).optional(),
})

/**
 * Email analytics dashboard endpoint
 */
async function handler(request: Request) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.ADMIN_SECRET || process.env.PAYLOAD_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const validation = analyticsQuerySchema.safeParse({
      emailId: searchParams.get('emailId') || undefined,
      subscriberEmail: searchParams.get('subscriberEmail') || undefined,
      type: searchParams.get('type') || 'email',
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid query parameters' },
        { status: 400 }
      )
    }

    const { emailId, subscriberEmail, type } = validation.data

    if (type === 'email' && emailId) {
      const analytics = await getEmailAnalytics(emailId)
      const topLinks = await getTopClickedLinks(emailId, 10)

      return NextResponse.json({
        analytics,
        topLinks,
      })
    }

    if (type === 'subscriber' && subscriberEmail) {
      const history = await getSubscriberEmailHistory(subscriberEmail)

      return NextResponse.json({
        subscriberEmail,
        history,
      })
    }

    if (type === 'links' && emailId) {
      const topLinks = await getTopClickedLinks(emailId, 20)

      return NextResponse.json({
        emailId,
        topLinks,
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    logError('email-analytics', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export const GET = withMonitoring(handler)
