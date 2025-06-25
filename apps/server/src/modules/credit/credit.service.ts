import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  credit_bucket_status_enum,
  credit_source_type_enum,
  transaction_type_enum,
  subscription_plans,
} from '@prisma/client';
import { CreditRepository } from './credit.repository';
import { CreateCreditBucketDto, CreateCreditTransactionDto } from './types';
import { CREDIT_CONFIG } from '../../config/constants';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    private readonly creditRepository: CreditRepository,
  ) {}

  async createCreditBucket(data: CreateCreditBucketDto) {
    try {
      const creditBucket = await this.creditRepository.createCreditBucket({
        user_id: data.userId,
        credits_total: data.creditsTotal,
        credits_used: 0,
        credits_remaining: data.creditsTotal,
        source_type: data.sourceType,
        status: credit_bucket_status_enum.active,
        description: data.description,
        expires_at: data.expiresAt,
        metadata: data.metadata
          ? JSON.parse(JSON.stringify(data.metadata))
          : null,
        user_subscription_id: data.userSubscriptionId,
      });

      this.logger.log(
        `🪣 Credit bucket created: ${creditBucket.id} with ${data.creditsTotal} credits for user: ${data.userId}`,
      );

      return creditBucket;
    } catch (error) {
      this.logger.error('❌ Failed to create credit bucket', error);
      throw error;
    }
  }

  async createCreditTransaction(data: CreateCreditTransactionDto) {
    try {
      const transaction = await this.creditRepository.createCreditTransaction({
        user_id: data.userId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        related_action_id: data.relatedActionId,
        stripe_payment_intent_id: data.stripePaymentIntentId,
      });

      this.logger.log(
        `💰 Credit transaction created: ${transaction.id} for user: ${data.userId}`,
      );
      return transaction;
    } catch (error) {
      this.logger.error('❌ Failed to create credit transaction', error);
      throw error;
    }
  }

  async getUserTotalCredits(userId: string): Promise<number> {
    const buckets = await this.creditRepository.findActiveCreditBuckets(userId);

    const totalCredits = buckets.reduce(
      (sum, bucket) => sum + (bucket.credits_remaining || 0),
      0,
    );
    this.logger.debug(`👀 User ${userId} has ${totalCredits} total credits`);

    return totalCredits;
  }

  async checkSufficientCredits(userId: string, requiredCredits: number = 1) {
    const totalCredits = await this.getUserTotalCredits(userId);

    return {
      hasSufficientCredits: totalCredits >= requiredCredits,
      availableCredits: totalCredits,
    };
  }

  async deductCredits(
    userId: string,
    creditsToDeduct: number,
    transactionType: transaction_type_enum,
    description?: string,
    relatedActionId?: string,
  ) {
    return this.creditRepository.executeTransaction(async (tx) => {
      // Get active credit buckets ordered by expiration (FIFO)
      const buckets = await tx.credit_buckets.findMany({
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

      if (buckets.length === 0) {
        throw new Error('No active credit buckets found');
      }

      // Check if user has sufficient credits
      const totalAvailable = buckets.reduce(
        (sum, bucket) => sum + (bucket.credits_remaining || 0),
        0,
      );

      if (totalAvailable < creditsToDeduct) {
        throw new Error(
          `Insufficient credits. Required: ${creditsToDeduct}, Available: ${totalAvailable}`,
        );
      }

      // Create transaction record
      const transaction = await tx.credit_transactions.create({
        data: {
          user_id: userId,
          amount: -creditsToDeduct,
          type: transactionType,
          description: description || `Credit deducted for ${transactionType}`,
          related_action_id: relatedActionId,
        },
      });

      // Deduct credits from buckets
      let remainingToDeduct = creditsToDeduct;
      const updatedBuckets = [];

      for (const bucket of buckets) {
        if (remainingToDeduct <= 0) break;

        const currentRemaining = bucket.credits_remaining || 0;
        const deductFromBucket = Math.min(remainingToDeduct, currentRemaining);
        const newRemaining = currentRemaining - deductFromBucket;
        const newUsed = (bucket.credits_used || 0) + deductFromBucket;

        const updatedBucket = await tx.credit_buckets.update({
          where: { id: bucket.id },
          data: {
            credits_used: newUsed,
            credits_remaining: newRemaining,
            status:
              newRemaining <= 0
                ? credit_bucket_status_enum.exhausted
                : credit_bucket_status_enum.active,
          },
        });

        updatedBuckets.push(updatedBucket);
        remainingToDeduct -= deductFromBucket;
      }

      this.logger.log(
        `💸 Deducted ${creditsToDeduct} credits from user: ${userId} (Transaction: ${transaction.id})`,
      );

      return {
        transaction,
        updatedBuckets,
        remainingCredits: totalAvailable - creditsToDeduct,
      };
    });
  }

  async grantMonthlyCredits(
    userId: string,
    plan: subscription_plans,
    userSubscriptionId?: string,
  ): Promise<void> {
    const expirationDays = CREDIT_CONFIG.EXPIRATION.SUBSCRIPTION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const [bucketResult, transactionResult] = await Promise.allSettled([
      this.createCreditBucket({
        userId,
        creditsTotal: plan.credits_per_month,
        sourceType: 'subscription',
        description: `Monthly subscription credits - ${plan.name}`,
        expiresAt,
        metadata: {
          subscription_plan_id: plan.id,
          plan_name: plan.name,
          granted_date: new Date().toISOString(),
          credits_per_month: plan.credits_per_month,
        },
        userSubscriptionId,
      }),
      this.createCreditTransaction({
        userId,
        amount: plan.credits_per_month,
        type: 'subscription_grant',
        description: `Monthly subscription credit grant - ${plan.name}`,
      }),
    ]);

    if (bucketResult.status === 'rejected') {
      this.logger.error(
        `Failed to create subscription credit bucket: ${bucketResult.reason?.message}`,
      );
    }

    if (transactionResult.status === 'rejected') {
      this.logger.error(
        `Failed to create credit transaction: ${transactionResult.reason?.message}`,
      );
    }

    this.logger.log(
      `🎁 ${plan.credits_per_month} subscription credits granted to user: ${userId} (expires: ${expiresAt})`,
    );
  }

  async expireCreditBucketsByUserSubscriptionId(userSubscriptionId: string) {
    const buckets = await this.creditRepository.findCreditBucketsByUserSubscriptionId(userSubscriptionId);

    if (buckets.length === 0) {
      return { expiredBuckets: [], error: null };
    }

    await this.creditRepository.updateCreditBucketsByUserSubscriptionId(
      userSubscriptionId,
      { status: credit_bucket_status_enum.expired }
    );

    this.logger.log(
      `⏰ Expired ${buckets.length} credit buckets for subscription: ${userSubscriptionId}`,
    );

    return { expiredBuckets: buckets, error: null };
  }

  async markCreditBucketsAsCancelled(userSubscriptionId: string) {
    const buckets = await this.creditRepository.findCreditBucketsByUserSubscriptionId(userSubscriptionId);

    if (buckets.length === 0) {
      return { cancelledBuckets: [], error: null };
    }

    await this.creditRepository.updateCreditBucketsByUserSubscriptionId(
      userSubscriptionId,
      { source_type: credit_source_type_enum.cancelled_plan }
    );

    this.logger.log(
      `🚫 Marked ${buckets.length} credit buckets as cancelled for subscription: ${userSubscriptionId}`,
    );

    return { cancelledBuckets: buckets, error: null };
  }

  async bulkCreateCreditTransactions(
    transactions: Array<{
      user_id: string;
      amount: number;
      type: transaction_type_enum;
      description: string;
    }>,
  ) {
    if (transactions.length === 0) {
      return { data: [], error: null };
    }

    try {
      const result = await this.creditRepository.createBulkCreditTransactions(transactions);

      this.logger.log(`📊 Created ${result.count} credit transactions in bulk`);
      return { data: result, error: null };
    } catch (error) {
      this.logger.error('❌ Failed to create bulk credit transactions', error);
      return { data: null, error };
    }
  }

  async getExpiredCreditBuckets() {
    try {
      const expiredBuckets = await this.creditRepository.findExpiredCreditBuckets();
      return { data: expiredBuckets, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async expireCreditBuckets(bucketIds: string[]) {
    if (bucketIds.length === 0) {
      return { data: null, error: null };
    }

    try {
      const result = await this.creditRepository.updateCreditBucketsByIds(
        bucketIds,
        { status: credit_bucket_status_enum.expired }
      );

      this.logger.log(`⏰ Expired ${result.count} credit buckets`);
      return { data: result, error: null };
    } catch (error) {
      this.logger.error('❌ Failed to expire credit buckets', error);
      return { data: null, error };
    }
  }
}
