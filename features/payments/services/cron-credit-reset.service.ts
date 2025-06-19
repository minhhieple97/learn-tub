import { CREDIT_RESET_MESSAGES } from '@/config/constants';
import { CreditResetService } from './credit-reset';
import { bulkExpireCreditBuckets } from '../queries/credit-queries';
import type { ICreditResetSummary } from '../types';
import { StatusCodes } from 'http-status-codes';

export type CronCreditResetResponse = {
  message: string;
  summary: ICreditResetSummary & {
    duration: string;
    expiredBucketsCount: number;
  };
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
      console.log('Starting monthly credit reset and expiration cleanup process...');
      const startTime = Date.now();

      // Step 1: Expire credit buckets based on expires_at field
      console.log('Step 1: Expiring credit buckets based on expiration dates...');
      const { expiredCount, error: expireError } = await bulkExpireCreditBuckets();

      if (expireError) {
        console.error('Failed to expire credit buckets:', expireError);
        // Continue with reset process even if expiration fails
      } else {
        console.log(`✅ Expired ${expiredCount} credit buckets`);
      }

      // Step 2: Execute monthly credit reset for all users
      console.log('Step 2: Executing monthly credit reset...');
      const summary = await CreditResetService.resetCreditsForAllUsers();

      const endTime = Date.now();
      const duration = `${endTime - startTime}ms`;

      const totalProcessed = summary.totalProcessed + (expiredCount || 0);
      const hasExpireError = expireError !== null;

      console.log('Credit reset and expiration cleanup completed:', {
        duration,
        expiredBucketsCount: expiredCount || 0,
        resetSummary: summary,
        expireError: hasExpireError ? expireError.message : null,
      });

      // Determine response based on results
      const hasResetErrors = summary.errors.length > 0;
      const hasResetSuccesses = summary.successfulResets > 0;
      const hasExpireSuccess = (expiredCount || 0) > 0;

      let message: string;
      let status: number;

      if ((hasResetSuccesses || hasExpireSuccess) && !hasResetErrors && !hasExpireError) {
        message = CREDIT_RESET_MESSAGES.SUCCESS;
        status = StatusCodes.OK;
      } else if ((hasResetSuccesses || hasExpireSuccess) && (hasResetErrors || hasExpireError)) {
        message = CREDIT_RESET_MESSAGES.PARTIAL_SUCCESS;
        status = StatusCodes.OK;
      } else {
        message = CREDIT_RESET_MESSAGES.ERROR;
        status = StatusCodes.INTERNAL_SERVER_ERROR;
      }

      // Add expiration errors to summary if any
      const updatedSummary = {
        ...summary,
        duration,
        expiredBucketsCount: expiredCount || 0,
      };

      if (hasExpireError && expireError) {
        updatedSummary.errors.push(`Credit expiration failed: ${expireError.message}`);
      }

      return {
        message,
        summary: updatedSummary,
        status,
      };
    } catch (error) {
      console.error('Credit reset and expiration process failed:', error);

      return {
        error: CREDIT_RESET_MESSAGES.ERROR,
        details: error instanceof Error ? error.message : 'Unknown error',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async executeExpiredCreditCleanup(): Promise<{
    success: boolean;
    expiredCount: number;
    error?: string;
  }> {
    try {
      console.log('Starting expired credit cleanup...');
      const startTime = Date.now();

      const { expiredCount, error } = await bulkExpireCreditBuckets();

      const endTime = Date.now();
      const duration = `${endTime - startTime}ms`;

      if (error) {
        console.error('Expired credit cleanup failed:', error);
        return {
          success: false,
          expiredCount: 0,
          error: error.message,
        };
      }

      console.log(
        `✅ Expired credit cleanup completed in ${duration}: ${expiredCount} buckets expired`,
      );

      return {
        success: true,
        expiredCount: expiredCount || 0,
      };
    } catch (error) {
      console.error('Expired credit cleanup process failed:', error);
      return {
        success: false,
        expiredCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
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
