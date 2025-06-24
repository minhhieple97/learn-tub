import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): string {
    return 'Stripe Webhook Service - NestJS API v1.0';
  }
}
