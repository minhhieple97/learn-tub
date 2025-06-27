import { Injectable } from '@nestjs/common';
import { ConnectionOptions } from 'bullmq';
import { AppConfigService } from '../app/config.service';

@Injectable()
export class RedisService {
  constructor(private appConfigService: AppConfigService) {}

  getRedisConfig(): ConnectionOptions {
    return {
      host: this.appConfigService.redisHost,
      port: this.appConfigService.redisPort,
      username: this.appConfigService.redisUsername,
      password: this.appConfigService.redisPassword,
      connectTimeout: 5000,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryDelayOnFailover: 100,
    };
  }
}
