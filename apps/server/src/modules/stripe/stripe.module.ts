import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StripeService } from './services/stripe.service';
import { StripeWebhookService } from './services/stripe-webhook.service';
import { PaymentModule } from '../payment/payment.module';
import { CreditModule } from '../credit/credit.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppConfigModule } from '@/src/config';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule,
    PaymentModule,
    CreditModule,
    SubscriptionModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [StripeService, StripeWebhookService],
  exports: [StripeService, StripeWebhookService],
})
export class StripeModule {}
