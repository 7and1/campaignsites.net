import { NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'
import { trackEmailEvent, verifyTrackingToken, trackLinkClick } from '@/lib/email/analytics'

/**
 * Email click tracking endpoint
 * Tracks click and redirects to target URL
 */
async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailId = searchParams.get('id')
    const token = searchParams.get('token')
    const targetUrl = searchParams.get('url')

    if (!emailId || !token || !targetUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const decodedUrl = decodeURIComponent(targetUrl)

    // Extract subscriber email from token (simplified)
    const subscriberEmail = searchParams.get('email') || 'unknown'

    // Verify token
    if (!verifyTrackingToken(emailId, subscriberEmail, token)) {
      // Still redirect but don't track
      return NextResponse.redirect(decodedUrl)
    }

    // Track click event
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    await trackEmailEvent({
      emailId,
      subscriberEmail,
      eventType: 'clicked',
      metadata: { url: decodedUrl },
      ipAddress: ip || undefined,
      userAgent: userAgent || undefined,
    })

    // Track link-specific click
    const linkId = searchParams.get('linkId')
    if (linkId) {
      await trackLinkClick(linkId)
    }

    // Redirect to target URL
    return NextResponse.redirect(decodedUrl)
  } catch (error) {
    logError('email-track-click', error)

    // Try to redirect anyway
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get('url')
    if (targetUrl) {
      return NextResponse.redirect(decodeURIComponent(targetUrl))
    }

    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}

export const GET = withMonitoring(handler)
