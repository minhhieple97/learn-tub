import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { StripeWebhookService } from '../../stripe/services/stripe-webhook.service';
import { IdempotentWebhookService } from './idempotent-webhook.service';
import { WebhookEventService } from './webhook-event.service';
import { StripeEventDto } from '../../stripe/dto/stripe-webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectQueue('webhook-processing') private readonly webhookQueue: Queue,
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly idempotentWebhookService: IdempotentWebhookService,
    private readonly webhookEventService: WebhookEventService,
  ) {}

  async processStripeWebhook(
    body: string,
    signature: string,
  ): Promise<{ eventId: string; queued: boolean }> {
    try {
      this.logger.log(
        `🎣 Processing stripe webhook - body type: ${typeof body}, signature type: ${typeof signature}`,
      );

      if (!body || typeof body !== 'string') {
        throw new BadRequestException(
          'Invalid webhook body - must be a string',
        );
      }

      if (!signature || typeof signature !== 'string') {
        throw new BadRequestException(
          'Invalid webhook signature - must be a string',
        );
      }

      // Construct and validate the Stripe event
      const event = this.stripeWebhookService.constructEvent(body, signature);

      // Validate the event structure using class-validator
      const eventDto = plainToClass(StripeEventDto, event);
      const validationErrors = await validate(eventDto);

      if (validationErrors.length > 0) {
        this.logger.error(
          '❌ Webhook event validation failed',
          validationErrors,
        );
        throw new BadRequestException('Invalid webhook event structure');
      }

      this.logger.log(
        `🎣 Processing webhook event: ${event.type} (${event.id})`,
      );

      // Check if we've already processed this event (idempotency)
      const { processed } =
        await this.idempotentWebhookService.isEventProcessed(event.id);

      if (processed) {
        this.logger.log(`⚠️ Event already processed: ${event.id}`);
        return { eventId: event.id, queued: false };
      }

      // Store the webhook event in database
      const webhookEvent = await this.webhookEventService.createWebhookEvent(
        event.id,
        event.type as any,
        event,
      );

      if (!webhookEvent) {
        throw new Error('Failed to create webhook event record');
      }

      // Add to processing queue for async handling
      const job = await this.webhookQueue.add(
        'process-webhook',
        {
          eventId: webhookEvent.id,
          stripeEventId: event.id,
          eventType: event.type,
          eventData: event,
        },
        {
          // Job options
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );

      // Create webhook job record
      await this.webhookEventService.createWebhookJob(
        webhookEvent.id,
        job.id.toString(),
        'webhook-processing',
      );

      this.logger.log(
        `✅ Webhook event queued for processing: ${event.id} (Job ID: ${job.id})`,
      );

      return { eventId: event.id, queued: true };
    } catch (error) {
      this.logger.error('❌ Failed to process webhook', error);

      if (
        error instanceof Error &&
        error.message?.includes('signature verification failed')
      ) {
        throw new BadRequestException('Invalid webhook signature');
      }

      throw error;
    }
  }

  async getWebhookStats() {
    return this.webhookEventService.getWebhookEventStats();
  }

  async retryFailedWebhooks() {
    const { data: failedEvents } =
      await this.webhookEventService.getRetryableWebhookEvents();

    if (!failedEvents || failedEvents.length === 0) {
      this.logger.log('📭 No failed webhooks to retry');
      return { retriedCount: 0 };
    }

    let retriedCount = 0;

    for (const event of failedEvents) {
      try {
        // Re-queue the failed event
        const job = await this.webhookQueue.add(
          'process-webhook',
          {
            eventId: event.id,
            stripeEventId: event.stripe_event_id,
            eventType: event.event_type,
            eventData: event.raw_payload,
            isRetry: true,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );

        // Update status to retrying
        await this.webhookEventService.updateWebhookEventStatus(
          event.id,
          'retrying',
          null,
          true,
        );

        // Create new job record
        await this.webhookEventService.createWebhookJob(
          event.id,
          job.id.toString(),
          'webhook-processing',
        );

        retriedCount++;
        this.logger.log(
          `🔄 Retrying webhook: ${event.stripe_event_id} (Job ID: ${job.id})`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to retry webhook ${event.stripe_event_id}`,
          error,
        );
      }
    }

    this.logger.log(`🔄 Retried ${retriedCount} failed webhooks`);
    return { retriedCount };
  }
}
