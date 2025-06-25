import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpCode,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WebhookService } from './services/webhook.service';
import type { IRequestWithRawBody } from './types';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'stripe-signature',
    required: true,
    description: 'Stripe webhook signature',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleStripeWebhook(
    @Req() req: IRequestWithRawBody,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ message: string; eventId?: string }> {
    try {
      this.logger.log('📥 Received Stripe webhook');

      const result = await this.webhookService.processStripeWebhook(
        req.rawBody,
        signature,
      );

      this.logger.log(`✅ Webhook processed successfully: ${result.eventId}`);

      return {
        message: 'Webhook processed successfully',
        eventId: result.eventId,
      };
    } catch (error) {
      this.logger.error('❌ Failed to process webhook', error);
      throw error;
    }
  }
}
