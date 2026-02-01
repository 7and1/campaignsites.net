/**
 * Cloudflare Queue Consumer for Email Delivery
 * Processes email jobs from Cloudflare Queue with automatic retries
 */

import { sendEmailViaResend } from './email/queue'
import { logger } from './monitoring/logger'

export interface EmailQueueMessage {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
  templateId?: string
  metadata?: Record<string, unknown>
}

/**
 * Queue consumer handler for email delivery
 * This runs on Cloudflare Workers when messages are added to the queue
 */
export async function handleEmailQueue(
  batch: MessageBatch<EmailQueueMessage>,
  env: CloudflareEnv
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    logger.error('RESEND_API_KEY not configured for email queue')
    return
  }

  for (const message of batch.messages) {
    try {
      const emailJob = message.body

      logger.info('Processing email from queue', {
        to: emailJob.to,
        templateId: emailJob.templateId,
      })

      const result = await sendEmailViaResend(resendApiKey, {
        to: emailJob.to,
        from: emailJob.from,
        subject: emailJob.subject,
        html: emailJob.html,
        text: emailJob.text,
        scheduledAt: new Date(),
        status: 'pending',
        templateId: emailJob.templateId,
        metadata: emailJob.metadata,
      })

      if (result.success) {
        logger.info('Email sent successfully from queue', {
          to: emailJob.to,
          templateId: emailJob.templateId,
        })
        message.ack()
      } else {
        logger.error('Email send failed from queue', undefined, {
          to: emailJob.to,
          error: result.error,
        })
        // Message will be retried automatically by Cloudflare Queue
        message.retry()
      }
    } catch (error) {
      logger.error('Email queue processing error', error instanceof Error ? error : undefined, {
        messageId: message.id,
      })
      message.retry()
    }
  }
}

/**
 * Send email via Cloudflare Queue
 * Provides guaranteed delivery with automatic retries
 */
export async function sendEmailViaQueue(
  queue: Queue<EmailQueueMessage>,
  email: EmailQueueMessage
): Promise<void> {
  await queue.send(email)
  logger.info('Email queued for delivery', {
    to: email.to,
    templateId: email.templateId,
  })
}

/**
 * Batch send emails via Cloudflare Queue
 */
export async function sendEmailBatchViaQueue(
  queue: Queue<EmailQueueMessage>,
  emails: EmailQueueMessage[]
): Promise<void> {
  await queue.sendBatch(emails.map((email) => ({ body: email })))
  logger.info('Email batch queued for delivery', {
    count: emails.length,
  })
}
