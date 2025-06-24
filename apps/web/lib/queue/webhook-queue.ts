import { Queue, Job } from "bullmq";
import { env } from "@/env.mjs";
import {
  WEBHOOK_QUEUE_NAMES,
  WEBHOOK_JOB_OPTIONS,
} from "@/features/payments/constants";
import type {
  IStripeWebhookJobData,
  IWebhookJobOptions,
} from "@/features/payments/types";

const redisConnection = {
  host: env.UPSTASH_REDIS_REST_URL?.replace("https://", "").replace(
    "http://",
    "",
  ),
  port: 6379,
  password: env.UPSTASH_REDIS_REST_TOKEN,
  tls: env.UPSTASH_REDIS_REST_URL?.startsWith("https://") ? {} : undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export const webhookQueue = new Queue<IStripeWebhookJobData>(
  WEBHOOK_QUEUE_NAMES.STRIPE_WEBHOOKS,
  {
    connection: redisConnection,
    defaultJobOptions: {
      ...WEBHOOK_JOB_OPTIONS,
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  },
);

export const webhookDLQ = new Queue<IStripeWebhookJobData>(
  WEBHOOK_QUEUE_NAMES.STRIPE_WEBHOOKS_DLQ,
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 200,
      removeOnFail: 100,
    },
  },
);

export class WebhookQueueManager {
  static async addWebhookJob(
    data: IStripeWebhookJobData,
    options?: IWebhookJobOptions,
  ): Promise<Job<IStripeWebhookJobData>> {
    const jobOptions = {
      ...WEBHOOK_JOB_OPTIONS,
      ...options,
      jobId: `webhook-${data.stripeEventId}`,
    };

    console.log(
      `🔄 Adding webhook job to queue: ${data.eventType} (${data.stripeEventId})`,
    );

    return await webhookQueue.add(
      `process-${data.eventType}`,
      data,
      jobOptions,
    );
  }

  static async addToDLQ(
    data: IStripeWebhookJobData,
    error: string,
  ): Promise<Job<IStripeWebhookJobData>> {
    const dlqData = {
      ...data,
      error,
      failedAt: new Date().toISOString(),
    };

    console.log(
      `💀 Adding failed job to DLQ: ${data.eventType} (${data.stripeEventId})`,
    );

    return await webhookDLQ.add(`failed-${data.eventType}`, dlqData, {
      removeOnComplete: 200,
      removeOnFail: 100,
    });
  }

  static async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      webhookQueue.getWaiting(),
      webhookQueue.getActive(),
      webhookQueue.getCompleted(),
      webhookQueue.getFailed(),
      webhookQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }

  static async cleanupOldJobs() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    await webhookQueue.clean(oneHourAgo, 100, "completed");

    await webhookQueue.clean(oneDayAgo, 50, "failed");

    console.log("🧹 Cleaned up old webhook jobs");
  }

  static async retryFromDLQ(jobId: string): Promise<boolean> {
    try {
      const job = await webhookDLQ.getJob(jobId);
      if (!job) {
        console.log(`Job ${jobId} not found in DLQ`);
        return false;
      }

      const { eventId, eventType, stripeEventId, payload } = job.data;

      await this.addWebhookJob(
        { eventId, eventType, stripeEventId, payload },
        {
          priority: 90,
          delay: 5000,
        },
      );

      await job.remove();

      console.log(`🔄 Retried job ${jobId} from DLQ`);
      return true;
    } catch (error) {
      console.error(`Failed to retry job ${jobId} from DLQ:`, error);
      return false;
    }
  }

  static async pauseQueue(): Promise<void> {
    await webhookQueue.pause();
    console.log("⏸️ Webhook queue paused");
  }

  static async resumeQueue(): Promise<void> {
    await webhookQueue.resume();
    console.log("▶️ Webhook queue resumed");
  }

  static async jobExists(stripeEventId: string): Promise<boolean> {
    const jobId = `webhook-${stripeEventId}`;
    const job = await webhookQueue.getJob(jobId);
    return !!job;
  }
}
