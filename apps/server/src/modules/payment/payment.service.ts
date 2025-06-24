import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePaymentHistoryDto {
  userId: string;
  amountCents: number;
  currency: string;
  paymentType: string;
  status: 'completed' | 'failed';
  description: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPaymentHistory(data: CreatePaymentHistoryDto) {
    try {
      const paymentHistory = await this.prisma.payment_history.create({
        data: {
          user_id: data.userId,
          amount_cents: data.amountCents,
          currency: data.currency,
          payment_type: data.paymentType,
          status: data.status,
          description: data.description,
          stripe_payment_intent_id: data.stripePaymentIntentId,
          stripe_invoice_id: data.stripeInvoiceId,
        },
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
    return this.prisma.payment_history.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPaymentHistoryById(id: string) {
    return this.prisma.payment_history.findUnique({
      where: { id },
    });
  }
}
