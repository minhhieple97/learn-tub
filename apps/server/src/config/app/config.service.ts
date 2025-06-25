import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return Number(this.configService.get<number>('app.port'));
  }

  get nodeEnv(): string {
    return this.configService.get<string>('app.nodeEnv');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get databaseUrl(): string {
    return this.configService.get<string>('app.databaseUrl');
  }

  get directUrl(): string {
    return this.configService.get<string>('app.directUrl');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('app.stripeSecretKey');
  }

  get stripeWebhookSecret(): string {
    return this.configService.get<string>('app.stripeWebhookSecret');
  }

  get upstashRedisRestUrl(): string {
    return this.configService.get<string>('app.upstashRedisRestUrl');
  }

  get upstashRedisRestToken(): string {
    return this.configService.get<string>('app.upstashRedisRestToken');
  }

  get logLevel(): string {
    return this.configService.get<string>('app.logLevel');
  }

  get cacheTtl(): number {
    return Number(this.configService.get<number>('app.cacheTtl'));
  }

  get redisHost(): string {
    return this.configService.get<string>('app.redisHost');
  }

  get redisPort(): number {
    return Number(this.configService.get<number>('app.redisPort'));
  }

  get redisPassword(): string {
    return this.configService.get<string>('app.redisPassword');
  }

  get redisUsername(): string {
    return this.configService.get<string>('app.redisUsername');
  }
}