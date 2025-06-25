import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { StripeWebhookService } from '../../stripe/services/stripe-webhook.service';
import { IdempotentWebhookService } from './idempotent-webhook.service';
import { WebhookEventService } from './webhook-event.service';
import { StripeEventDto } from '../../stripe/dto/stripe-webhook.dto';
import { QUEUE_CONFIG } from '@/src/config/constants';
import { webhook_event_status } from '@prisma/client';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectQueue(QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING)
    private readonly webhookQueue: Queue,
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly idempotentWebhookService: IdempotentWebhookService,
    private readonly webhookEventService: WebhookEventService,
  ) {}

  async processStripeWebhook(
    body: Buffer,
    signature: string,
  ): Promise<{ eventId: string; queued: boolean }> {
    try {
      this.logger.log(
        `🎣 Processing stripe webhook - body type: ${typeof body}, signature type: ${typeof signature}`,
      );

      if (!signature || typeof signature !== 'string') {
        throw new BadRequestException(
          'Invalid webhook signature - must be a string',
        );
      }

      const event = this.stripeWebhookService.constructEvent(body, signature);

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

      const { processed } =
        await this.idempotentWebhookService.isEventProcessed(event.id);

      if (processed) {
        this.logger.log(`⚠️ Event already processed: ${event.id}`);
        return { eventId: event.id, queued: false };
      }

      const webhookEvent = await this.webhookEventService.createWebhookEvent(
        event.id,
        event.type,
        event,
      );

      if (!webhookEvent) {
        throw new Error('Failed to create webhook event record');
      }

      const job = await this.webhookQueue.add(
        QUEUE_CONFIG.JOB_NAMES.WEBHOOK_STRIPE,
        {
          eventId: webhookEvent.id,
          stripeEventId: event.id,
          eventType: event.type,
          eventData: event,
        },
        {
          jobId: webhookEvent.id,
        },
      );

      await this.webhookEventService.createWebhookJob(
        webhookEvent.id,
        QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING,
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
        const job = await this.webhookQueue.add(
          QUEUE_CONFIG.JOB_NAMES.WEBHOOK_STRIPE,
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

        await this.webhookEventService.updateWebhookEventStatus(
          event.id,
          webhook_event_status.retrying,
          null,
          true,
        );

        await this.webhookEventService.createWebhookJob(
          event.id,
          QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING,
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
