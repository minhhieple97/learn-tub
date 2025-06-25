import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentHistoryDto } from './types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createPaymentHistory(data: CreatePaymentHistoryDto) {
    try {
      const paymentHistory = await this.paymentRepository.createPaymentHistory({
        user_id: data.userId,
        amount_cents: data.amountCents,
        currency: data.currency,
        payment_type: data.paymentType,
        status: data.status,
        description: data.description,
        stripe_payment_intent_id: data.stripePaymentIntentId,
        stripe_invoice_id: data.stripeInvoiceId,
      });

      this.logger.log(
        `💳 Payment history created: ${paymentHistory.id} for user: ${data.userId}`,
      );
      return paymentHistory;
    } catch (error) {
      this.logger.error('❌ Failed to create payment history', error);
      throw error;
    }
  }

  async getPaymentHistoryByUser(userId: string) {
    return this.paymentRepository.findPaymentHistoryByUser(userId);
  }

  async getPaymentHistoryById(id: string) {
    return this.paymentRepository.findPaymentHistoryById(id);
  }

  async createPaymentHistoryTransaction(data: CreatePaymentHistoryDto) {
    try {
      const paymentHistoryData = {
        user_id: data.userId,
        amount_cents: data.amountCents,
        currency: data.currency,
        payment_type: data.paymentType,
        status: data.status,
        description: data.description,
        stripe_payment_intent_id: data.stripePaymentIntentId,
        stripe_invoice_id: data.stripeInvoiceId,
      };

      const paymentHistory =
        await this.paymentRepository.createPaymentHistoryTransaction(
          paymentHistoryData,
        );

      this.logger.log(
        `💳 Payment history created (transaction): ${paymentHistory.id} for user: ${data.userId}`,
      );
      return paymentHistory;
    } catch (error) {
      this.logger.error(
        '❌ Failed to create payment history (transaction)',
        error,
      );
      throw error;
    }
  }
}
