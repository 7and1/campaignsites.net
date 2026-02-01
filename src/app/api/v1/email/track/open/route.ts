import { NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'
import { trackEmailEvent, verifyTrackingToken } from '@/lib/email/analytics'

/**
 * Email open tracking endpoint
 * Returns a 1x1 transparent pixel
 */
async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailId = searchParams.get('id')
    const token = searchParams.get('token')

    if (!emailId || !token) {
      return new Response(TRANSPARENT_PIXEL, {
        headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
    }

    // Extract subscriber email from token (simplified - in production use proper decoding)
    const subscriberEmail = searchParams.get('email') || 'unknown'

    // Verify token
    if (!verifyTrackingToken(emailId, subscriberEmail, token)) {
      return new Response(TRANSPARENT_PIXEL, {
        headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
    }

    // Track open event
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    await trackEmailEvent({
      emailId,
      subscriberEmail,
      eventType: 'opened',
      ipAddress: ip || undefined,
      userAgent: userAgent || undefined,
    })

    // Return transparent pixel
    return new Response(TRANSPARENT_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    logError('email-track-open', error)
    return new Response(TRANSPARENT_PIXEL, {
      headers: { 'Content-Type': 'image/gif' },
    })
  }
}

// 1x1 transparent GIF
const TRANSPARENT_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export const GET = withMonitoring(handler)
