import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './services/webhook.service';
import { StripeWebhookService } from './services/stripe-webhook.service';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhookEventService } from './services/webhook-event.service';
import { IdempotentWebhookService } from './services/idempotent-webhook.service';
import { PaymentModule } from '../payment/payment.module';
import { PaymentService } from '../payment/payment.service';
import { CreditModule } from '../credit/credit.module';
import { CreditService } from '../credit/credit.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SubscriptionService } from '../subscription/subscription.service';

@Module({
  imports: [
    PaymentModule,
    CreditModule,
    SubscriptionModule,
    BullModule.registerQueueAsync({
      name: 'webhook-processing',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        defaultJobOptions: configService.get('queue.options.defaultJobOptions'),
      }),
      inject: [ConfigService],
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
    IdempotentWebhookService,
    WebhookProcessor,
  ],
  exports: [
    WebhookService,
    StripeWebhookService,
    WebhookEventService,
    IdempotentWebhookService,
  ],
})
export class WebhookModule {}
