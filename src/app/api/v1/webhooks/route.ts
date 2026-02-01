import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'

const webhookSchema = z.object({
  event: z.enum(['create', 'update', 'delete']),
  collection: z.string(),
  doc: z.object({
    id: z.union([z.string(), z.number()]),
    slug: z.string().optional(),
  }),
  secret: z.string(),
})

/**
 * Webhook endpoint for Payload CMS
 * Invalidates cache when content is updated
 */
async function handler(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const validation = webhookSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const { event, collection, doc, secret } = validation.data

    // Verify webhook secret
    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.PAYLOAD_SECRET
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 403 })
    }

    // Invalidate cache based on collection and event
    switch (collection) {
      case 'posts':
        revalidateTag('posts')
        revalidatePath('/blog')
        if (doc.slug) {
          revalidatePath(`/blog/${doc.slug}`)
        }
        break

      case 'case-studies':
        revalidateTag('case-studies')
        revalidatePath('/gallery')
        if (doc.slug) {
          revalidatePath(`/gallery/${doc.slug}`)
        }
        break

      case 'tools':
        revalidateTag('tools')
        revalidatePath('/tools')
        if (doc.slug) {
          revalidatePath(`/tools/${doc.slug}`)
        }
        break

      case 'media':
        revalidateTag('media')
        break

      default:
        // Unknown collection, still acknowledge
        break
    }

    // Log webhook event
    console.log(`Webhook received: ${event} ${collection} ${doc.id}`)

    // Send notification (optional)
    if (process.env.SLACK_WEBHOOK_URL && event === 'create') {
      await sendSlackNotification(event, collection, doc)
    }

    return NextResponse.json({
      ok: true,
      message: `Cache invalidated for ${collection}`,
      event,
      collection,
      docId: doc.id,
    })
  } catch (error) {
    logError('webhook', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Send Slack notification for content events
 */
async function sendSlackNotification(
  event: string,
  collection: string,
  doc: { id: string | number; slug?: string }
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: `New ${collection} ${event}d`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New ${collection} ${event}d*\nID: ${doc.id}${doc.slug ? `\nSlug: ${doc.slug}` : ''}`,
        },
      },
    ],
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  } catch (error) {
    logError('slack-notification', error)
  }
}

export const POST = withMonitoring(handler)
