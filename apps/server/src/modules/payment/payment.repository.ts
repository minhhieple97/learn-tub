import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentHistoryData } from './types';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentHistory(data: CreatePaymentHistoryData) {
    return this.prisma.payment_history.create({ data });
  }

  async findPaymentHistoryByUser(userId: string) {
    return this.prisma.payment_history.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findPaymentHistoryById(id: string) {
    return this.prisma.payment_history.findUnique({
      where: { id },
    });
  }
} 