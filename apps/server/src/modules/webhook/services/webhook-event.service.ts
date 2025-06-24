import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { webhook_event_status, webhook_event_type } from '@repo/db';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WebhookEventService {
  private readonly logger = new Logger(WebhookEventService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createWebhookEvent(
    stripeEventId: string,
    eventType: string,
    payload: any,
  ) {
    try {
      const webhookEvent = await this.prisma.webhook_events.create({
        data: {
          stripe_event_id: stripeEventId,
          event_type: eventType as webhook_event_type,
          status: this.configService.get(
            'webhook.status.pending',
          ) as webhook_event_status,
          raw_payload: payload,
          max_attempts: 3,
          attempts: 0,
        },
      });

      this.logger.log(`📝 Created webhook event record: ${webhookEvent.id}`);
      return webhookEvent;
    } catch (error) {
      this.logger.error('❌ Failed to create webhook event', error);
      throw error;
    }
  }

  async createWebhookJob(
    eventId: string,
    jobId: string,
    queueName: string,
    priority: number = 0,
  ) {
    try {
      const job = await this.prisma.webhook_jobs.create({
        data: {
          webhook_event_id: eventId,
          job_id: jobId,
          queue_name: queueName,
          priority,
          delay_ms: 0,
        },
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
      const data: any = { status: status as webhook_event_status };

      if (errorMessage !== undefined) {
        data.error_message = errorMessage;
      }

      if (incrementAttempts) {
        data.attempts = { increment: 1 };
      }

      const updatedEvent = await this.prisma.webhook_events.update({
        where: { id: eventId },
        data,
      });

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
    return this.prisma.webhook_events.findUnique({
      where: { id: eventId },
    });
  }

  async getWebhookEventByStripeId(stripeEventId: string) {
    return this.prisma.webhook_events.findFirst({
      where: { stripe_event_id: stripeEventId },
    });
  }

  async getRetryableWebhookEvents() {
    const maxRetryAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoffDate = new Date(Date.now() - maxRetryAge);

    try {
      const failedEvents = await this.prisma.webhook_events.findMany({
        where: {
          status: this.configService.get(
            'webhook.status.failed',
          ) as webhook_event_status,
          attempts: { lt: 3 },
          created_at: { gte: cutoffDate },
        },
        orderBy: { created_at: 'desc' },
        take: 50,
      });

      return { data: failedEvents };
    } catch (error) {
      this.logger.error('❌ Failed to get retryable webhook events', error);
      return { data: [], error };
    }
  }

  async getWebhookEventStats() {
    try {
      const [
        totalCount,
        pendingCount,
        processingCount,
        completedCount,
        failedCount,
        retryingCount,
      ] = await Promise.all([
        this.prisma.webhook_events.count(),
        this.prisma.webhook_events.count({
          where: {
            status: this.configService.get(
              'webhook.status.pending',
            ) as webhook_event_status,
          },
        }),
        this.prisma.webhook_events.count({
          where: {
            status: this.configService.get(
              'webhook.status.processing',
            ) as webhook_event_status,
          },
        }),
        this.prisma.webhook_events.count({
          where: {
            status: this.configService.get(
              'webhook.status.completed',
            ) as webhook_event_status,
          },
        }),
        this.prisma.webhook_events.count({
          where: {
            status: this.configService.get(
              'webhook.status.failed',
            ) as webhook_event_status,
          },
        }),
        this.prisma.webhook_events.count({
          where: {
            status: this.configService.get(
              'webhook.status.retrying',
            ) as webhook_event_status,
          },
        }),
      ]);

      return {
        total: totalCount,
        pending: pendingCount,
        processing: processingCount,
        completed: completedCount,
        failed: failedCount,
        retrying: retryingCount,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get webhook event stats', error);
      throw error;
    }
  }
}
