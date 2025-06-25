import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AppConfigModule, AppConfigService } from '../app';

@Module({
  imports: [AppConfigModule],
  providers: [RedisService, AppConfigService],
  exports: [RedisService],
})
export class RedisModule {}
