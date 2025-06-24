import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CreditModule } from './modules/credit/credit.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

import { EnvValidationModule } from './config';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    EnvValidationModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');
        // Convert Upstash REST URL to Redis URL format
        // Remove https:// and replace with redis://
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
