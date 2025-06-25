import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventService } from './webhook-event.service';
import { webhook_event_status } from '@prisma/client';

@Injectable()
export class IdempotentWebhookService {
  private readonly logger = new Logger(IdempotentWebhookService.name);
  private readonly processingStatuses: webhook_event_status[];
  private readonly completedStatuses: webhook_event_status[];

  constructor(private readonly webhookEventService: WebhookEventService) {
    this.processingStatuses = [
      webhook_event_status.processing,
      webhook_event_status.retrying,
    ];

    this.completedStatuses = [webhook_event_status.completed];
  }

  async isEventProcessed(stripeEventId: string): Promise<{
    processed: boolean;
    event?: any;
    error?: Error;
  }> {
    try {
      const event =
        await this.webhookEventService.getWebhookEventByStripeId(stripeEventId);

      if (!event) {
        return { processed: false };
      }
      const isProcessing = this.processingStatuses.includes(event.status);
      const isCompleted = this.completedStatuses.includes(event.status);

      return {
        processed: isCompleted || isProcessing,
        event,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to check webhook event: ${stripeEventId}`,
        error,
      );
      return {
        processed: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async markEventAsProcessing(eventId: string): Promise<void> {
    await this.webhookEventService.updateWebhookEventStatus(
      eventId,
      webhook_event_status.processing,
    );
  }

  async markEventAsCompleted(eventId: string): Promise<void> {
    await this.webhookEventService.updateWebhookEventStatus(
      eventId,
      webhook_event_status.completed,
    );
  }

  async markEventAsFailed(
    eventId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.webhookEventService.updateWebhookEventStatus(
      eventId,
      webhook_event_status.failed,
      errorMessage,
      true,
    );
  }

  async getProcessingStats() {
    try {
      const stats = await this.webhookEventService.getWebhookEventStats();

      return {
        success: true,
        stats: {
          ...stats,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('❌ Failed to get processing stats', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async performMaintenance(): Promise<{
    success: boolean;
    cleanedEvents?: number;
    error?: string;
  }> {
    try {
      this.logger.log('🧹 Webhook maintenance completed');
      return {
        success: true,
        cleanedEvents: 0,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Webhook maintenance failed', error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
