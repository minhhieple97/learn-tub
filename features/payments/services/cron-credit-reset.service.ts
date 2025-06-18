import { CREDIT_RESET_MESSAGES } from '@/config/constants';
import { CreditResetService } from './credit-reset';
import type { ICreditResetSummary } from '../types';
import { StatusCodes } from 'http-status-codes';

export type CronCreditResetResponse = {
  message: string;
  summary: ICreditResetSummary & { duration: string };
  status: number;
};

export type CronCreditResetError = {
  error: string;
  details?: string;
  status: number;
};

export class CronCreditResetService {
  static async executeCreditReset(): Promise<CronCreditResetResponse | CronCreditResetError> {
    try {
      console.log('Starting monthly credit reset process...');
      const startTime = Date.now();

      // Execute credit reset for all users
      const summary = await CreditResetService.resetCreditsForAllUsers();

      const endTime = Date.now();
      const duration = `${endTime - startTime}ms`;

      console.log('Credit reset completed:', {
        duration,
        ...summary,
      });

      // Determine response based on results
      const hasErrors = summary.errors.length > 0;
      const hasSuccesses = summary.successfulResets > 0;

      let message: string;
      let status: number;

      if (hasSuccesses && !hasErrors) {
        message = CREDIT_RESET_MESSAGES.SUCCESS;
        status = StatusCodes.OK;
      } else if (hasSuccesses && hasErrors) {
        message = CREDIT_RESET_MESSAGES.PARTIAL_SUCCESS;
        status = StatusCodes.OK;
      } else {
        message = CREDIT_RESET_MESSAGES.ERROR;
        status = StatusCodes.INTERNAL_SERVER_ERROR;
      }

      return {
        message,
        summary: {
          ...summary,
          duration,
        },
        status,
      };
    } catch (error) {
      console.error('Credit reset failed:', error);

      return {
        error: CREDIT_RESET_MESSAGES.ERROR,
        details: error instanceof Error ? error.message : 'Unknown error',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static validateCronSecret(authHeader: string | null, cronSecret: string): boolean {
    return Boolean(authHeader && authHeader === `Bearer ${cronSecret}`);
  }

  static createUnauthorizedResponse(): CronCreditResetError {
    return {
      error: CREDIT_RESET_MESSAGES.UNAUTHORIZED,
      status: StatusCodes.UNAUTHORIZED,
    };
  }

  static createHealthCheckResponse() {
    return {
      message: 'Credit reset cron endpoint is running',
      timestamp: new Date().toISOString(),
    };
  }
}
