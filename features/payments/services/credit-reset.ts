import { Tables } from '@/database.types';
import { CREDIT_RESET_CONFIG, CREDIT_RESET_MESSAGES, TRANSACTION_TYPES } from '@/config/constants';
import {
  getAllUsersForCreditReset,
  getUsersWithActiveSubscriptions,
  resetUserCredits,
  bulkCreateCreditTransactions,
} from '../queries';
import { ICreditResetResult, ICreditResetSummary, IUserWithSubscription } from '../types';

type IUserCredits = Tables<'user_credits'> & {
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

  private static async processUserCreditReset(
    userCredits: IUserCredits,
    userSubscriptions: Map<string, IUserWithSubscription>,
  ): Promise<ICreditResetResult> {
    const result: ICreditResetResult = {
      userId: userCredits.user_id,
      subscriptionReset: false,
      purchaseReset: false,
      creditsGranted: 0,
    };

    try {
      const now = new Date().toISOString();
      const updates: Parameters<typeof resetUserCredits>[1] = {};
      const transactions: Array<{
        user_id: string;
        amount: number;
        type: typeof TRANSACTION_TYPES.MONTHLY_RESET | typeof TRANSACTION_TYPES.SUBSCRIPTION_GRANT;
        description: string;
      }> = [];

      const shouldResetSubscription = this.shouldResetCredits(
        userCredits.last_reset_subscription_date,
      );

      if (shouldResetSubscription) {
        updates.credits_subscription = 0;
        updates.credits_used_this_month = 0;
        updates.last_reset_subscription_date = now;
        result.subscriptionReset = true;

        if (userCredits.credits_subscription > 0) {
          transactions.push({
            user_id: userCredits.user_id,
            amount: -userCredits.credits_subscription,
            type: TRANSACTION_TYPES.MONTHLY_RESET,
            description: CREDIT_RESET_MESSAGES.SUBSCRIPTION_RESET,
          });
        }

        const userSubscription = userSubscriptions.get(userCredits.user_id);
        if (userSubscription) {
          const creditsToAdd = userSubscription.subscription_plans.credits_per_month;
          updates.credits_subscription = creditsToAdd;
          result.creditsGranted += creditsToAdd;

          transactions.push({
            user_id: userCredits.user_id,
            amount: creditsToAdd,
            type: TRANSACTION_TYPES.SUBSCRIPTION_GRANT,
            description: `${CREDIT_RESET_MESSAGES.SUBSCRIPTION_GRANT} - ${userSubscription.subscription_plans.name}`,
          });
        }
      }

      const shouldResetPurchase = this.shouldResetCredits(userCredits.last_reset_purchase_date);

      if (shouldResetPurchase && userCredits.credits_purchase) {
        updates.credits_purchase = 0;
        updates.last_reset_purchase_date = now;
        result.purchaseReset = true;

        transactions.push({
          user_id: userCredits.user_id,
          amount: -userCredits.credits_purchase,
          type: TRANSACTION_TYPES.MONTHLY_RESET,
          description: CREDIT_RESET_MESSAGES.PURCHASE_RESET,
        });
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await resetUserCredits(userCredits.user_id, updates);

        if (updateError) {
          throw new Error(`Failed to update credits: ${updateError.message}`);
        }
      }

      if (transactions.length > 0) {
        const { error: transactionError } = await bulkCreateCreditTransactions(transactions);

        if (transactionError) {
          console.error(
            `Failed to create transactions for user ${userCredits.user_id}:`,
            transactionError,
          );
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
      const { data: allUsers, error: usersError } = await getAllUsersForCreditReset();

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      if (!allUsers || allUsers.length === 0) {
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

      const batchSize = CREDIT_RESET_CONFIG.BATCH_SIZE;
      const batches = [];

      for (let i = 0; i < allUsers.length; i += batchSize) {
        batches.push(allUsers.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map((user) =>
          this.processUserCreditReset(user, subscriptionMap),
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
