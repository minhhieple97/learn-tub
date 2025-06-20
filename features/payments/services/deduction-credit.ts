import { createClient } from '@/lib/supabase/server';
import { CREDIT_ACTION_COUNTS, USER_SUBSCRIPTION_STATUS } from '@/config/constants';
import { Tables, TablesInsert, TablesUpdate } from '@/database.types';

type CreditBucket = Tables<'credit_buckets'>;
type CreditTransaction = TablesInsert<'credit_transactions'>;
type TransactionType = keyof typeof CREDIT_ACTION_COUNTS;

export type ICreditDeductionRequest = {
  userId: string;
  command: TransactionType;
  description?: string;
  relatedActionId?: string;
};

export type ICreditDeductionResult = {
  success: boolean;
  error?: string;
  transactionId?: string;
  remainingCredits?: number;
};

export class CreditDeductionService {
  static async checkAvailableCredits(
    userId: string,
    requiredCredits: number,
  ): Promise<{ hasCredits: boolean; availableCredits: number }> {
    const supabase = await createClient();
    const { data: buckets, error } = await supabase
      .from('credit_buckets')
      .select('credits_remaining')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('credits_remaining', 0)
      .order('expires_at', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error checking available credits:', error);
      return { hasCredits: false, availableCredits: 0 };
    }

    const totalCredits = (buckets || []).reduce(
      (sum: number, bucket: { credits_remaining: number | null }) =>
        sum + (bucket.credits_remaining || 0),
      0,
    );

    return {
      hasCredits: totalCredits >= requiredCredits,
      availableCredits: totalCredits,
    };
  }

  private static async getActiveCreditBuckets(userId: string): Promise<CreditBucket[]> {
    const supabase = await createClient();
    const { data: buckets, error } = await supabase
      .from('credit_buckets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('credits_remaining', 0)
      .order('expires_at', { ascending: true, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to fetch credit buckets: ${error.message}`);
    }

    return buckets || [];
  }

  static async deductCredits(request: ICreditDeductionRequest): Promise<ICreditDeductionResult> {
    const { userId, command, description, relatedActionId } = request;
    const requiredCredits = CREDIT_ACTION_COUNTS[command];

    if (!requiredCredits) {
      return {
        success: false,
        error: `Invalid command: ${command}`,
      };
    }

    try {
      const { hasCredits, availableCredits } = await CreditDeductionService.checkAvailableCredits(
        userId,
        requiredCredits,
      );

      if (!hasCredits) {
        return {
          success: false,
          error: `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`,
        };
      }

      const result = await CreditDeductionService.executeDeduction(
        userId,
        command,
        requiredCredits,
        description,
        relatedActionId,
      );

      return result;
    } catch (error) {
      console.error('Credit deduction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private static async executeDeduction(
    userId: string,
    command: TransactionType,
    creditsToDeduct: number,
    description?: string,
    relatedActionId?: string,
  ): Promise<ICreditDeductionResult> {
    const supabase = await createClient();

    const activeBuckets = await CreditDeductionService.getActiveCreditBuckets(userId);

    if (activeBuckets.length === 0) {
      return {
        success: false,
        error: 'No active credit buckets found',
      };
    }

    const transactionData: CreditTransaction = {
      user_id: userId,
      type: command,
      amount: -creditsToDeduct,
      description: description || `Credit deducted for ${command}`,
      related_action_id: relatedActionId,
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert(transactionData)
      .select('id')
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    let remainingToDeduct = creditsToDeduct;
    const bucketUpdates: Array<{ id: string; update: TablesUpdate<'credit_buckets'> }> = [];

    for (const bucket of activeBuckets) {
      if (remainingToDeduct <= 0) break;

      const currentRemaining = bucket.credits_remaining || 0;
      const deductFromBucket = Math.min(remainingToDeduct, currentRemaining);
      const newRemaining = currentRemaining - deductFromBucket;
      const newUsed = (bucket.credits_used || 0) + deductFromBucket;

      bucketUpdates.push({
        id: bucket.id,
        update: {
          credits_used: newUsed,
          status:
            newRemaining <= 0
              ? USER_SUBSCRIPTION_STATUS.EXHAUSTED
              : USER_SUBSCRIPTION_STATUS.ACTIVE,
          updated_at: new Date().toISOString(),
        },
      });

      remainingToDeduct -= deductFromBucket;
    }

    for (const { id, update } of bucketUpdates) {
      const { error: updateError } = await supabase
        .from('credit_buckets')
        .update(update)
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to update credit bucket ${id}: ${updateError.message}`);
      }
    }

    const { availableCredits } = await CreditDeductionService.checkAvailableCredits(userId, 0);

    return {
      success: true,
      transactionId: transaction.id,
      remainingCredits: availableCredits,
    };
  }

  static async validateUserAction(
    userId: string,
    command: TransactionType,
  ): Promise<{ canProceed: boolean; error?: string; availableCredits?: number }> {
    const requiredCredits = CREDIT_ACTION_COUNTS[command];

    if (!requiredCredits) {
      return {
        canProceed: false,
        error: `Invalid command: ${command}`,
      };
    }

    const { hasCredits, availableCredits } = await CreditDeductionService.checkAvailableCredits(
      userId,
      requiredCredits,
    );

    return {
      canProceed: hasCredits,
      error: hasCredits
        ? undefined
        : `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`,
      availableCredits,
    };
  }
}

export const deductCredits = CreditDeductionService.deductCredits;
export const checkAvailableCredits = CreditDeductionService.checkAvailableCredits;
export const validateUserAction = CreditDeductionService.validateUserAction;

export const validateAndDeductCredits = async (
  request: ICreditDeductionRequest,
): Promise<ICreditDeductionResult> => {
  const validation = await CreditDeductionService.validateUserAction(
    request.userId,
    request.command,
  );

  if (!validation.canProceed) {
    return {
      success: false,
      error: validation.error || 'Credit validation failed',
    };
  }

  return await CreditDeductionService.deductCredits(request);
};
