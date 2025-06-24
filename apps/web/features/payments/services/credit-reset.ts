import { Tables } from '@/database.types';
import {
  CREDIT_BUCKET_STATUS,
  CREDIT_RESET_CONFIG,
  CREDIT_RESET_MESSAGES,
  CREDIT_SOURCE_TYPES,
  TRANSACTION_TYPES,
} from '@/config/constants';
import { PLAN_ID_MAPPING } from '../constants';
import {
  getAllUsersForCreditReset,
  getUsersWithActiveSubscriptions,
  resetCreditBuckets,
  bulkCreateCreditTransactions,
  createCreditBucket,
} from '../queries';
import { ICreditResetResult, ICreditResetSummary, IUserWithSubscription } from '../types';

type ICreditBucket = Tables<'credit_buckets'> & {
  profiles: { id: string; email: string } | null;
  user_subscriptions: {
    id: string;
    plan_id: string;
    status: string;
    subscription_plans: {
      id: string;
      name: string;
      credits_per_month: number;
    };
  } | null;
};

export class CreditResetService {
  private static shouldResetBucket(bucket: ICreditBucket): boolean {
    if (!bucket.expires_at) {
      return false;
    }

    const expiryDate = new Date(bucket.expires_at);
    const now = new Date();
    const isExpired = now >= expiryDate;

    if (!isExpired) {
      return false;
    }

    if (bucket.source_type === CREDIT_SOURCE_TYPES.SUBSCRIPTION) {
      return this.isFreePlanBucket(bucket);
    }

    return true;
  }

  private static isFreePlanBucket(bucket: ICreditBucket): boolean {
    if (!bucket.user_subscriptions?.subscription_plans?.id) {
      return false;
    }

    const planId = bucket.user_subscriptions.subscription_plans.id;
    const freePlanId = PLAN_ID_MAPPING.FREE;

    return planId === freePlanId;
  }

  private static async processUserCreditReset(
    userBuckets: ICreditBucket[],
    userSubscriptions: Map<string, IUserWithSubscription>,
  ): Promise<ICreditResetResult> {
    if (userBuckets.length === 0) {
      return {
        userId: '',
        subscriptionReset: false,
        purchaseReset: false,
        creditsGranted: 0,
        error: 'No buckets to process',
      };
    }

    const firstBucket = userBuckets[0];
    if (!firstBucket) {
      return {
        userId: '',
        subscriptionReset: false,
        purchaseReset: false,
        creditsGranted: 0,
        error: 'No valid bucket found',
      };
    }

    const userId = firstBucket.user_id;
    const result: ICreditResetResult = {
      userId,
      subscriptionReset: false,
      purchaseReset: false,
      creditsGranted: 0,
    };

    try {
      const transactions: Array<{
        user_id: string;
        amount: number;
        type: 'monthly_reset' | 'subscription_grant';
        description: string;
      }> = [];

      const subscriptionBuckets = userBuckets.filter(
        (b) => b.source_type === CREDIT_SOURCE_TYPES.SUBSCRIPTION,
      );
      const purchaseBuckets = userBuckets.filter(
        (b) => b.source_type === CREDIT_SOURCE_TYPES.PURCHASE,
      );

      for (const bucket of subscriptionBuckets) {
        if (this.shouldResetBucket(bucket)) {
          const { error: resetError } = await resetCreditBuckets(userId, 'subscription');
          if (resetError) {
            throw new Error(`Failed to reset subscription buckets: ${resetError.message}`);
          }

          result.subscriptionReset = true;

          if (bucket.credits_remaining && bucket.credits_remaining > 0) {
            transactions.push({
              user_id: userId,
              amount: -bucket.credits_remaining,
              type: 'monthly_reset',
              description: CREDIT_RESET_MESSAGES.SUBSCRIPTION_RESET,
            });
          }

          const userSubscription = userSubscriptions.get(userId);
          if (userSubscription) {
            const creditsToAdd = userSubscription.subscription_plans.credits_per_month;
            const nextResetDate = new Date();
            nextResetDate.setDate(
              nextResetDate.getDate() + CREDIT_RESET_CONFIG.RESET_INTERVAL_DAYS,
            );

            const { error: createError } = await createCreditBucket({
              userId,
              creditsTotal: creditsToAdd,
              sourceType: 'subscription',
              description: `${CREDIT_RESET_MESSAGES.SUBSCRIPTION_GRANT} - ${userSubscription.subscription_plans.name}`,
              expiresAt: nextResetDate.toISOString(),
              metadata: {
                subscription_plan_id: userSubscription.plan_id,
                last_reset_date: new Date().toISOString(),
              },
            });

            if (createError) {
              throw new Error(`Failed to create new subscription bucket: ${createError.message}`);
            }

            result.creditsGranted += creditsToAdd;

            transactions.push({
              user_id: userId,
              amount: creditsToAdd,
              type: 'subscription_grant',
              description: `${CREDIT_RESET_MESSAGES.SUBSCRIPTION_GRANT} - ${userSubscription.subscription_plans.name}`,
            });
          }
        }
      }

      for (const bucket of purchaseBuckets) {
        if (this.shouldResetBucket(bucket)) {
          const { error: resetError } = await resetCreditBuckets(userId, 'purchase');
          if (resetError) {
            throw new Error(`Failed to reset purchase buckets: ${resetError.message}`);
          }

          result.purchaseReset = true;

          if (bucket.credits_remaining && bucket.credits_remaining > 0) {
            transactions.push({
              user_id: userId,
              amount: -bucket.credits_remaining,
              type: 'monthly_reset',
              description: CREDIT_RESET_MESSAGES.PURCHASE_RESET,
            });
          }
        }
      }

      if (transactions.length > 0) {
        const { error: transactionError } = await bulkCreateCreditTransactions(transactions);

        if (transactionError) {
          console.error(`Failed to create transactions for user ${userId}:`, transactionError);
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  static async resetCreditsForAllUsers(): Promise<ICreditResetSummary> {
    const summary: ICreditResetSummary = {
      totalProcessed: 0,
      successfulResets: 0,
      errors: [],
      subscriptionResetsCount: 0,
      purchaseResetsCount: 0,
      totalCreditsGranted: 0,
    };

    try {
      const { data: allBuckets, error: bucketsError } = await getAllUsersForCreditReset();

      if (bucketsError) {
        throw new Error(`Failed to fetch credit buckets: ${bucketsError.message}`);
      }

      if (!allBuckets || allBuckets.length === 0) {
        return summary;
      }

      const { data: subscriptions, error: subscriptionsError } =
        await getUsersWithActiveSubscriptions();

      if (subscriptionsError) {
        throw new Error(`Failed to fetch subscriptions: ${subscriptionsError.message}`);
      }

      const subscriptionMap = new Map<string, IUserWithSubscription>();
      subscriptions?.forEach((sub) => {
        subscriptionMap.set(sub.user_id, sub);
      });

      // Group buckets by user_id
      const userBucketsMap = new Map<string, ICreditBucket[]>();
      allBuckets.forEach((bucket) => {
        const userId = bucket.user_id;
        if (!userBucketsMap.has(userId)) {
          userBucketsMap.set(userId, []);
        }
        userBucketsMap.get(userId)!.push(bucket);
      });

      const userBucketEntries = Array.from(userBucketsMap.entries());
      const batchSize = CREDIT_RESET_CONFIG.BATCH_SIZE;
      const batches = [];

      for (let i = 0; i < userBucketEntries.length; i += batchSize) {
        batches.push(userBucketEntries.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(([userId, buckets]) =>
          this.processUserCreditReset(buckets, subscriptionMap),
        );

        const batchResults = await Promise.allSettled(batchPromises);

        for (const result of batchResults) {
          summary.totalProcessed++;

          if (result.status === 'fulfilled') {
            const resetResult = result.value;

            if (resetResult.error) {
              summary.errors.push(`User ${resetResult.userId}: ${resetResult.error}`);
            } else {
              summary.successfulResets++;
              if (resetResult.subscriptionReset) {
                summary.subscriptionResetsCount++;
              }
              if (resetResult.purchaseReset) {
                summary.purchaseResetsCount++;
              }
              summary.totalCreditsGranted += resetResult.creditsGranted;
            }
          } else {
            summary.errors.push(`Batch processing failed: ${result.reason}`);
          }
        }
      }
    } catch (error) {
      summary.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return summary;
  }
}
