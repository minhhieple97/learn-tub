import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';
import { AppConfigService } from '../app/config.service';

@Injectable()
export class RedisService {
  constructor(private appConfigService: AppConfigService) {}

  getRedisConfig(): ConnectionOptions {
    return {
      host: this.appConfigService.redisHost,
      port: this.appConfigService.redisPort,
      password: this.appConfigService.redisPassword,
      connectTimeout: 60000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      tls: {
        rejectUnauthorized: false,
      },
    };
  }
}
