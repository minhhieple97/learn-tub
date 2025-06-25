import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule, AppConfigService } from '@/src/config';
import { QUEUE_CONFIG } from '@/src/config/constants';
import { RedisService } from '@/src/config/redis/redis.service';
import { RedisModule } from '@/src/config/redis/redis.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule, AppConfigModule],
      useFactory: (redisConfig: RedisService) => ({
        connection: redisConfig.getRedisConfig(),
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [RedisService, AppConfigService],
    }),
    AppConfigModule,
  ],
  providers: [RedisService, AppConfigService],
  exports: [BullModule],
})
export class QueueModule {}
