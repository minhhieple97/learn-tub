import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CreditModule } from './modules/credit/credit.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

import { AppConfigModule, AppConfigService } from './config';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    AppConfigModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
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
    WebhookModule,
    PaymentModule,
    CreditModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
