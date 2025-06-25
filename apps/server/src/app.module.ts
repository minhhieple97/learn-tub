import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CreditModule } from './modules/credit/credit.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { StripeModule } from './modules/stripe/stripe.module';

import { AppConfigModule } from './config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queues/queue.module';

@Module({
  imports: [
    AppConfigModule,
    QueueModule,
    PrismaModule,
    StripeModule,
    WebhookModule,
    PaymentModule,
    CreditModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
