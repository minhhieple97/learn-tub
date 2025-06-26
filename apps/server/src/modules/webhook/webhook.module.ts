import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookEventService } from './services/webhook-event.service';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { IdempotentWebhookService } from './services/idempotent-webhook.service';
import { StripeModule } from '../stripe/stripe.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigModule } from '@/src/config';
import { QUEUE_CONFIG } from '@/src/config/constants';
import { WebhookProcessor } from './processors/webhook.processor';

@Module({
  imports: [
    AppConfigModule,
    StripeModule,
    PrismaModule,
    BullModule.registerQueueAsync({
      name: QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING,
      imports: [AppConfigModule],
      useFactory: () => ({
        defaultJobOptions: QUEUE_CONFIG.OPTIONS.DEFAULT_JOB_OPTIONS,
      }),
    }),
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    WebhookEventService,
    WebhookEventRepository,
    IdempotentWebhookService,
    PrismaService,
    WebhookProcessor,
  ],
  exports: [WebhookService, WebhookEventService, IdempotentWebhookService],
})
export class WebhookModule {}
