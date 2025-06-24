import { Worker, Job } from 'bullmq';
import { env } from '@/env.mjs';
import { StripeWebhookService } from '@/features/payments/services/stripe-webhook.service';
import { WEBHOOK_QUEUE_NAMES } from '@/features/payments/constants';
import {
  markWebhookEventAsProcessing,
  markWebhookEventAsCompleted,
  markWebhookEventAsFailed,
} from '@/features/payments/queries/webhook-events';
import type { IStripeWebhookJobData } from '@/features/payments/types';

const redisConnection = {
  host: env.UPSTASH_REDIS_REST_URL?.replace('https://', '').replace('http://', ''),
  port: 6379,
  password: env.UPSTASH_REDIS_REST_TOKEN,
  tls: env.UPSTASH_REDIS_REST_URL?.startsWith('https://') ? {} : undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export const webhookWorker = new Worker<IStripeWebhookJobData>(
  WEBHOOK_QUEUE_NAMES.STRIPE_WEBHOOKS,
  async (job: Job<IStripeWebhookJobData>) => {
    const startTime = Date.now();
    const { eventId, eventType, stripeEventId, payload } = job.data;

    console.log(`🔄 Processing webhook job: ${eventType} (${stripeEventId})`);

    try {
      await markWebhookEventAsProcessing(eventId);

      const stripeEvent = {
        id: stripeEventId,
        type: eventType,
        data: {
          object: payload.data?.object || payload,
        },
      };

      await StripeWebhookService.processWebhookEvent(stripeEvent);

      await markWebhookEventAsCompleted(eventId);

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ Successfully processed webhook: ${eventType} (${stripeEventId}) in ${processingTime}ms`,
      );

      return {
        success: true,
        processingTime,
        eventType,
        stripeEventId,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(
        `❌ Failed to process webhook: ${eventType} (${stripeEventId}) in ${processingTime}ms:`,
        error,
      );

      await markWebhookEventAsFailed(eventId, errorMessage, true);

      throw new Error(`Webhook processing failed: ${errorMessage}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

webhookWorker.on('ready', () => {
  console.log('🚀 Webhook worker is ready and waiting for jobs');
});

webhookWorker.on('active', (job: Job<IStripeWebhookJobData>) => {
  console.log(`⚡ Started processing job: ${job.data.eventType} (${job.data.stripeEventId})`);
});

webhookWorker.on('completed', (job: Job<IStripeWebhookJobData>, result: any) => {
  console.log(`✅ Completed job: ${job.data.eventType} (${job.data.stripeEventId})`);
});

webhookWorker.on('failed', async (job: Job<IStripeWebhookJobData> | undefined, error: Error) => {
  if (!job) {
    console.error('❌ Job failed but job data is undefined:', error);
    return;
  }

  const { eventId, eventType, stripeEventId } = job.data;
  console.error(`❌ Job failed: ${eventType} (${stripeEventId}):`, error.message);

  const maxAttempts = job.opts.attempts || 3;
  const currentAttempt = job.attemptsMade || 0;

  if (currentAttempt >= maxAttempts) {
    console.error(
      `💀 Job permanently failed after ${maxAttempts} attempts: ${eventType} (${stripeEventId})`,
    );

    await markWebhookEventAsFailed(
      eventId,
      `Permanently failed after ${maxAttempts} attempts: ${error.message}`,
      false,
    );
  }
});

webhookWorker.on('error', (error: Error) => {
  console.error('❌ Webhook worker error:', error);
});

webhookWorker.on('stalled', (jobId: string) => {
  console.warn(`⚠️ Job stalled: ${jobId}`);
});

const gracefulShutdown = async () => {
  console.log('🛑 Shutting down webhook worker gracefully...');

  try {
    await webhookWorker.close();
    console.log('✅ Webhook worker shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during webhook worker shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default webhookWorker;
