import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../app/config.service';

type ICacheOptions = {
  ttl?: number;
};

@Injectable()
export class CacheClientService {
  private readonly logger = new Logger(CacheClientService.name);
  private readonly redis: Redis;

  constructor(private readonly appConfigService: AppConfigService) {
    this.redis = new Redis(this.appConfigService.redisUrl, {
      connectTimeout: 5000,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis for caching');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis cache connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: ICacheOptions = {},
  ): Promise<boolean> {
    try {
      const ttl = options.ttl || this.appConfigService.cacheTtl;
      const serializedValue = JSON.stringify(value);

      if (ttl > 0) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<boolean> {
    try {
      if (Array.isArray(key)) {
        if (key.length === 0) return true;
        await this.redis.del(...key);
      } else {
        await this.redis.del(key);
      }
      return true;
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushall();
      return true;
    } catch (error) {
      this.logger.error('Cache flush all error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.redis.disconnect();
      this.logger.log('Disconnected from Redis cache');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis cache:', error);
    }
  }
}
