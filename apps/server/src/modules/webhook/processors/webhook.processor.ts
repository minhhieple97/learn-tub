import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { StripeWebhookService } from '../../stripe/services/stripe-webhook.service';
import { IdempotentWebhookService } from '../services/idempotent-webhook.service';
import { webhook_event_type } from '@prisma/client';
import { QUEUE_CONFIG } from '@/src/config/constants';

type IWebhookJobData = {
  eventId: string;
  stripeEventId: string;
  eventType: webhook_event_type;
  eventData: any;
  isRetry?: boolean;
};

@Processor(QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING)
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly idempotentWebhookService: IdempotentWebhookService,
  ) {
    super();
  }

  async process(job: Job<IWebhookJobData>) {
    switch (job.name) {
      case QUEUE_CONFIG.JOB_NAMES.WEBHOOK_STRIPE:
        return this.processWebhook(job);
      case QUEUE_CONFIG.JOB_NAMES.WEBHOOK_STRIPE_CLEANUP:
        return this.cleanupOldEvents();
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processWebhook(job: Job<IWebhookJobData>) {
    const { eventId, stripeEventId, eventType, eventData, isRetry } = job.data;
    const startTime = Date.now();

    try {
      this.logger.log(
        `🔄 Processing ${isRetry ? 'retry of ' : ''}webhook event: ${eventType} (${stripeEventId})`,
      );

      await this.idempotentWebhookService.markEventAsProcessing(eventId);

      await this.stripeWebhookService.processWebhookEvent(eventData);

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

      await this.idempotentWebhookService.markEventAsFailed(
        eventId,
        errorMessage,
      );

      throw error;
    }
  }

  private async cleanupOldEvents() {
    try {
      this.logger.log('🧹 Starting webhook event cleanup');

      // TODO: Implement logic to clean up old webhook events
      this.logger.log('✅ Webhook event cleanup completed');
      return { success: true };
    } catch (error) {
      this.logger.error('❌ Failed to clean up webhook events', error);
      throw error;
    }
  }
}
