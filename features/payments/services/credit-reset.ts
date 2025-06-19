import { Tables, Database } from '@/database.types';
import { CREDIT_RESET_CONFIG, CREDIT_RESET_MESSAGES, TRANSACTION_TYPES } from '@/config/constants';
import {
  getAllUsersForCreditReset,
  getUsersWithActiveSubscriptions,
  resetCreditBuckets,
  bulkCreateCreditTransactions,
  createCreditBucket,
} from '../queries';
import { ICreditResetResult, ICreditResetSummary, IUserWithSubscription } from '../types';

type CreditSourceType = Database['public']['Enums']['credit_source_type_enum'];
type ICreditBucket = Tables<'credit_buckets'> & {
  profiles: { id: string; email: string } | null;
};

export class CreditResetService {
  private static shouldResetCredits(lastResetDate: string | null): boolean {
    if (!lastResetDate) return true;

    const lastReset = new Date(lastResetDate);
    const now = new Date();
    const daysSinceReset = Math.floor(
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceReset >= CREDIT_RESET_CONFIG.RESET_INTERVAL_DAYS;
  }

  private static shouldResetBucket(bucket: ICreditBucket): boolean {
    // Check if bucket has expired or needs monthly reset
    if (bucket.expires_at) {
      const expiryDate = new Date(bucket.expires_at);
      const now = new Date();
      if (now >= expiryDate) {
        return true;
      }
    }

    // For subscription buckets, check if it's time for monthly reset
    if (bucket.source_type === 'subscription') {
      // Check metadata for last reset date or use created_at
      const metadata = bucket.metadata as any;
      const lastResetDate = metadata?.last_reset_date || bucket.created_at;
      return this.shouldResetCredits(lastResetDate);
    }

    // For purchase buckets, they typically don't reset monthly unless specified
    if (bucket.source_type === 'purchase') {
      const metadata = bucket.metadata as any;
      if (metadata?.monthly_reset === true) {
        const lastResetDate = metadata?.last_reset_date || bucket.created_at;
        return this.shouldResetCredits(lastResetDate);
      }
    }

    return false;
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

    const userId = userBuckets[0].user_id;
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
        type: typeof TRANSACTION_TYPES.MONTHLY_RESET | typeof TRANSACTION_TYPES.SUBSCRIPTION_GRANT;
        description: string;
      }> = [];

      // Group buckets by source type
      const subscriptionBuckets = userBuckets.filter((b) => b.source_type === 'subscription');
      const purchaseBuckets = userBuckets.filter((b) => b.source_type === 'purchase');

      // Process subscription buckets
      for (const bucket of subscriptionBuckets) {
        if (this.shouldResetBucket(bucket)) {
          // Mark old bucket as expired
          const { error: resetError } = await resetCreditBuckets(userId, 'subscription');
          if (resetError) {
            throw new Error(`Failed to reset subscription buckets: ${resetError.message}`);
          }

          result.subscriptionReset = true;

          // Add transaction for removing old credits
          if (bucket.credits_remaining && bucket.credits_remaining > 0) {
            transactions.push({
              user_id: userId,
              amount: -bucket.credits_remaining,
              type: TRANSACTION_TYPES.MONTHLY_RESET,
              description: CREDIT_RESET_MESSAGES.SUBSCRIPTION_RESET,
            });
          }

          // Create new subscription bucket if user has active subscription
          const userSubscription = userSubscriptions.get(userId);
          if (userSubscription) {
            const creditsToAdd = userSubscription.subscription_plans.credits_per_month;
            const nextResetDate = new Date();
            nextResetDate.setDate(
              nextResetDate.getDate() + CREDIT_RESET_CONFIG.RESET_INTERVAL_DAYS,
            );

            const { error: createError } = await createCreditBucket(
              userId,
              creditsToAdd,
              'subscription',
              `${CREDIT_RESET_MESSAGES.SUBSCRIPTION_GRANT} - ${userSubscription.subscription_plans.name}`,
              nextResetDate.toISOString(),
              {
                subscription_plan_id: userSubscription.plan_id,
                last_reset_date: new Date().toISOString(),
              },
            );

            if (createError) {
              throw new Error(`Failed to create new subscription bucket: ${createError.message}`);
            }

            result.creditsGranted += creditsToAdd;

            transactions.push({
              user_id: userId,
              amount: creditsToAdd,
              type: TRANSACTION_TYPES.SUBSCRIPTION_GRANT,
              description: `${CREDIT_RESET_MESSAGES.SUBSCRIPTION_GRANT} - ${userSubscription.subscription_plans.name}`,
            });
          }
        }
      }

      // Process purchase buckets that need monthly reset
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
              type: TRANSACTION_TYPES.MONTHLY_RESET,
              description: CREDIT_RESET_MESSAGES.PURCHASE_RESET,
            });
          }
        }
      }

      // Create transactions
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
