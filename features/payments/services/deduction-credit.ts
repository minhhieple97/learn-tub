import { CREDIT_ACTION_COUNTS } from '@/config/constants';
import {
  checkAvailableCreditsForDeduction,
  executeCreditDeduction,
} from '@/features/payments/queries';

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
    return checkAvailableCreditsForDeduction(userId, requiredCredits);
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

      const result = await executeCreditDeduction(
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
