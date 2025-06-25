import { Injectable } from '@nestjs/common';
import { webhook_event_status, webhook_event_type } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ICreateWebhookEventData,
  ICreateWebhookJobData,
  IUpdateWebhookEventData,
} from '../types';

@Injectable()
export class WebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWebhookEvent(data: ICreateWebhookEventData) {
    return this.prisma.webhook_events.create({ data });
  }

  async createWebhookJob(data: ICreateWebhookJobData) {
    return this.prisma.webhook_jobs.create({ data });
  }

  async updateWebhookEvent(eventId: string, data: IUpdateWebhookEventData) {
    return this.prisma.webhook_events.update({
      where: { id: eventId },
      data,
    });
  }

  async findWebhookEventById(eventId: string) {
    return this.prisma.webhook_events.findUnique({
      where: { id: eventId },
    });
  }

  async findWebhookEventByStripeId(stripeEventId: string) {
    return this.prisma.webhook_events.findFirst({
      where: { stripe_event_id: stripeEventId },
    });
  }

  async findRetryableWebhookEvents(maxRetryAge: number, limit = 50) {
    const cutoffDate = new Date(Date.now() - maxRetryAge);
    return this.prisma.webhook_events.findMany({
      where: {
        status: 'failed' as webhook_event_status,
        attempts: { lt: 3 },
        created_at: { gte: cutoffDate },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async getWebhookEventStats() {
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
        where: { status: 'pending' as webhook_event_status },
      }),
      this.prisma.webhook_events.count({
        where: { status: 'processing' as webhook_event_status },
      }),
      this.prisma.webhook_events.count({
        where: { status: 'completed' as webhook_event_status },
      }),
      this.prisma.webhook_events.count({
        where: { status: 'failed' as webhook_event_status },
      }),
      this.prisma.webhook_events.count({
        where: { status: 'retrying' as webhook_event_status },
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
  }
} 