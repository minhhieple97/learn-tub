import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhookEventService } from './services/webhook-event.service';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { IdempotentWebhookService } from './services/idempotent-webhook.service';
import { StripeModule } from '../stripe/stripe.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_CONFIG } from '../../config/constants';
import { AppConfigModule } from '@/src/config';

@Module({
  imports: [
    AppConfigModule,
    StripeModule,
    PrismaModule,
    BullModule.registerQueueAsync({
      name: QUEUE_CONFIG.NAMES.WEBHOOK_PROCESSING,
      imports: [ConfigModule],
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
    WebhookProcessor,
    PrismaService,
  ],
  exports: [WebhookService, WebhookEventService, IdempotentWebhookService],
})
export class WebhookModule {}
