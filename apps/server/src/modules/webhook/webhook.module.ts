import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './services/webhook.service';
import { StripeWebhookService } from './services/stripe-webhook.service';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhookEventService } from './services/webhook-event.service';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { IdempotentWebhookService } from './services/idempotent-webhook.service';
import { PaymentModule } from '../payment/payment.module';
import { PaymentService } from '../payment/payment.service';
import { CreditModule } from '../credit/credit.module';
import { CreditService } from '../credit/credit.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SubscriptionService } from '../subscription/subscription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRepository } from '../payment/payment.repository';
import { QUEUE_CONFIG } from '../../config/constants';
import { AppConfigModule } from '@/src/config';

@Module({
  imports: [
    AppConfigModule,
    PaymentModule,
    CreditModule,
    SubscriptionModule,
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
    SubscriptionService,
    CreditService,
    PaymentService,
    WebhookService,
    StripeWebhookService,
    WebhookEventService,
    WebhookEventRepository,
    IdempotentWebhookService,
    WebhookProcessor,
    PrismaService,
    PaymentRepository,
  ],
  exports: [
    WebhookService,
    StripeWebhookService,
    WebhookEventService,
    IdempotentWebhookService,
  ],
})
export class WebhookModule {}
