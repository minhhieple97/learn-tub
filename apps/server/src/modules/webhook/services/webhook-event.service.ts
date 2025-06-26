import { Injectable, Logger } from '@nestjs/common';
import { webhook_event_status, webhook_event_type } from '@prisma/client';
import { WebhookEventRepository } from '../repositories/webhook-event.repository';

@Injectable()
export class WebhookEventService {
  private readonly logger = new Logger(WebhookEventService.name);

  constructor(
    private readonly webhookEventRepository: WebhookEventRepository,
  ) {}

  private convertStripeEventType(stripeEventType: string): webhook_event_type {
    const convertedType = stripeEventType.replace(
      /\./g,
      '_',
    ) as webhook_event_type;

    const validTypes = Object.values(webhook_event_type);
    if (!validTypes.includes(convertedType)) {
      this.logger.warn(
        `⚠️ Unknown event type: ${stripeEventType} (converted: ${convertedType})`,
      );
      throw new Error(`Unsupported webhook event type: ${stripeEventType}`);
    }

    return convertedType;
  }

  async createWebhookEvent(
    stripeEventId: string,
    eventType: string,
    payload: object,
  ) {
    try {
      const dbEventType = this.convertStripeEventType(eventType);

      const webhookEvent = await this.webhookEventRepository.createWebhookEvent(
        {
          stripe_event_id: stripeEventId,
          event_type: dbEventType,
          status: webhook_event_status.pending,
          raw_payload: JSON.stringify(payload),
          max_attempts: 3,
          attempts: 0,
        },
      );
      this.logger.log(`📝 Created webhook event record: ${webhookEvent.id}`);
      return webhookEvent;
    } catch (error) {
      this.logger.error('❌ Failed to create webhook event', error);
      throw error;
    }
  }

  async createWebhookJob(
    eventId: string,
    queueName: string,
    priority: number = 0,
  ) {
    try {
      const job = await this.webhookEventRepository.createWebhookJob({
        webhook_event_id: eventId,
        queue_name: queueName,
        priority,
        delay_ms: 0,
      });

      this.logger.log(`📝 Created webhook job record: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('❌ Failed to create webhook job', error);
      throw error;
    }
  }

  async updateWebhookEventStatus(
    eventId: string,
    status: string,
    errorMessage?: string | null,
    incrementAttempts: boolean = false,
  ) {
    try {
      const updateData: any = { status: status as webhook_event_status };

      if (errorMessage !== undefined) {
        updateData.error_message = errorMessage;
      }

      if (incrementAttempts) {
        updateData.attempts = { increment: 1 };
      }

      const updatedEvent = await this.webhookEventRepository.updateWebhookEvent(
        eventId,
        updateData,
      );

      this.logger.log(
        `📝 Updated webhook event ${eventId} status to: ${status}`,
      );
      return updatedEvent;
    } catch (error) {
      this.logger.error(`❌ Failed to update webhook event ${eventId}`, error);
      throw error;
    }
  }

  async getWebhookEvent(eventId: string) {
    return this.webhookEventRepository.findWebhookEventById(eventId);
  }

  async getWebhookEventByStripeId(stripeEventId: string) {
    return this.webhookEventRepository.findWebhookEventByStripeId(
      stripeEventId,
    );
  }

  async getRetryableWebhookEvents() {
    const maxRetryAge = 24 * 60 * 60 * 1000;

    try {
      const failedEvents =
        await this.webhookEventRepository.findRetryableWebhookEvents(
          maxRetryAge,
        );
      return { data: failedEvents };
    } catch (error) {
      this.logger.error('❌ Failed to get retryable webhook events', error);
      return { data: [], error };
    }
  }

  async getWebhookEventStats() {
    try {
      return await this.webhookEventRepository.getWebhookEventStats();
    } catch (error) {
      this.logger.error('❌ Failed to get webhook event stats', error);
      throw error;
    }
  }
}
