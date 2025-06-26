import { Injectable } from '@nestjs/common';
import { credit_bucket_status_enum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateCreditBucketData, ICreateCreditTransactionData } from './types';

@Injectable()
export class CreditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCreditBucket(data: ICreateCreditBucketData) {
    return this.prisma.credit_buckets.create({ data });
  }

  async createCreditTransaction(data: ICreateCreditTransactionData) {
    return this.prisma.credit_transactions.create({ data });
  }

  async findActiveCreditBuckets(userId: string) {
    const now = new Date();
    return this.prisma.credit_buckets.findMany({
      where: {
        user_id: userId,
        status: credit_bucket_status_enum.active,
        OR: [{ expires_at: null }, { expires_at: { gt: now } }],
      },
      select: {
        credits_remaining: true,
      },
    });
  }

  async findActiveCreditBucketsForDeduction(userId: string) {
    return this.prisma.credit_buckets.findMany({
      where: {
        user_id: userId,
        status: credit_bucket_status_enum.active,
        credits_remaining: { gt: 0 },
      },
      orderBy: [
        { expires_at: { sort: 'asc', nulls: 'last' } },
        { created_at: 'asc' },
      ],
    });
  }

  async updateCreditBucket(id: string, data: Partial<ICreateCreditBucketData>) {
    return this.prisma.credit_buckets.update({
      where: { id },
      data,
    });
  }

  async findCreditBucketsByUserSubscriptionId(userSubscriptionId: string) {
    return this.prisma.credit_buckets.findMany({
      where: {
        user_subscription_id: userSubscriptionId,
        status: credit_bucket_status_enum.active,
      },
      select: {
        id: true,
        user_id: true,
        credits_remaining: true,
        description: true,
      },
    });
  }

  async updateCreditBucketsByUserSubscriptionId(
    userSubscriptionId: string,
    data: Partial<ICreateCreditBucketData>,
  ) {
    return this.prisma.credit_buckets.updateMany({
      where: {
        user_subscription_id: userSubscriptionId,
        status: credit_bucket_status_enum.active,
      },
      data,
    });
  }

  async createBulkCreditTransactions(
    transactions: ICreateCreditTransactionData[],
  ) {
    return this.prisma.credit_transactions.createMany({
      data: transactions,
    });
  }

  async findExpiredCreditBuckets() {
    const now = new Date();
    return this.prisma.credit_buckets.findMany({
      where: {
        status: credit_bucket_status_enum.active,
        expires_at: {
          not: null,
          lt: now,
        },
      },
    });
  }

  async updateCreditBucketsByIds(
    bucketIds: string[],
    data: Partial<ICreateCreditBucketData>,
  ) {
    return this.prisma.credit_buckets.updateMany({
      where: {
        id: { in: bucketIds },
      },
      data,
    });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
