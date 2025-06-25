import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CreditModule } from './modules/credit/credit.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { StripeModule } from './modules/stripe/stripe.module';

import { AppConfigModule, AppConfigService } from './config';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    AppConfigModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        const redisUrl = appConfigService.upstashRedisRestUrl;
        const redisConnectionUrl = redisUrl?.replace('https://', 'redis://');

        return {
          redis: redisConnectionUrl,
        };
      },
    }),
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
