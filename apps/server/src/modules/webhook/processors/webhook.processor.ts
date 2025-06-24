import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

import { StripeWebhookService } from '../services/stripe-webhook.service';
import { IdempotentWebhookService } from '../services/idempotent-webhook.service';
import { WebhookEventService } from '../services/webhook-event.service';
import { webhook_event_type } from '@repo/db';

interface WebhookJobData {
  eventId: string;
  stripeEventId: string;
  eventType: webhook_event_type;
  eventData: any;
  isRetry?: boolean;
}

@Processor('webhook-processing')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly idempotentWebhookService: IdempotentWebhookService,
    private readonly webhookEventService: WebhookEventService,
  ) {}

  @Process('process-webhook')
  async processWebhook(job: Job<WebhookJobData>) {
    const { eventId, stripeEventId, eventType, eventData, isRetry } = job.data;
    const startTime = Date.now();

    try {
      this.logger.log(
        `🔄 Processing ${isRetry ? 'retry of ' : ''}webhook event: ${eventType} (${stripeEventId})`,
      );

      // Mark the event as processing
      await this.idempotentWebhookService.markEventAsProcessing(eventId);

      // Process the webhook event
      await this.stripeWebhookService.processWebhookEvent(eventData);

      // Mark the event as completed
      await this.idempotentWebhookService.markEventAsCompleted(eventId);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `✅ Webhook processed successfully: ${eventType} (${stripeEventId}) in ${processingTime}ms`,
      );

      return { success: true, eventId, processingTime };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `❌ Failed to process webhook: ${eventType} (${stripeEventId}) in ${processingTime}ms`,
        error,
      );

      // Mark the event as failed
      await this.idempotentWebhookService.markEventAsFailed(
        eventId,
        errorMessage,
      );

      // Rethrow the error to trigger Bull's retry mechanism if attempts remain
      throw error;
    }
  }

  @Process({ name: 'cleanup-old-events', concurrency: 1 })
  async cleanupOldEvents() {
    try {
      this.logger.log('🧹 Starting webhook event cleanup');

      // Here we would implement logic to clean up old webhook events
      // For example, archiving or deleting events older than X days

      this.logger.log('✅ Webhook event cleanup completed');
      return { success: true };
    } catch (error) {
      this.logger.error('❌ Failed to clean up webhook events', error);
      throw error;
    }
  }
}
