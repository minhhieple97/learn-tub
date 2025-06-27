import { Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

export const createCacheInvalidationFunctions = (
  cacheService: CacheService,
) => ({
  invalidateUserCacheOnCreditChange: (userId: string) =>
    cacheService.invalidateUserCacheOnCreditChange(userId),

  invalidateUserCacheOnSubscriptionChange: (userId: string) =>
    cacheService.invalidateUserCacheOnSubscriptionChange(userId),

  invalidateUserCacheOnDeduction: (userId: string) =>
    cacheService.invalidateUserCacheOnCreditChange(userId),

  invalidateAllUserCache: (userId: string) =>
    cacheService.invalidateUserCache(userId),

  invalidateMultipleUsersCacheOnCreditChange: (userIds: string[]) =>
    cacheService.invalidateMultipleUsersCacheOnCreditChange(userIds),

  invalidateMultipleUsersCacheOnSubscriptionChange: (userIds: string[]) =>
    cacheService.invalidateMultipleUsersCacheOnSubscriptionChange(userIds),
});

export class CacheUtils {
  static async safeInvalidate(
    invalidateFunction: () => Promise<any>,
    context: string,
    logger?: Logger,
  ): Promise<void> {
    try {
      logger?.log(`🔄 Starting cache invalidation: ${context}`);
      await invalidateFunction();
      logger?.log(`🔄 Cache invalidated successfully: ${context}`);
    } catch (error) {
      logger?.error(`❌ Failed to invalidate cache: ${context}`, error);
    }
  }

  static async batchInvalidate(
    invalidationPromises: Promise<any>[],
    context: string,
    logger?: any,
  ): Promise<void> {
    try {
      logger?.log(`🔄 Starting batch cache invalidation: ${context}`);
      await Promise.allSettled(invalidationPromises);
      if (logger) {
        logger.log(`🔄 Batch cache invalidation completed: ${context}`);
      }
    } catch (error) {
      logger?.error(`❌ Batch cache invalidation failed: ${context}`, error);
    }
  }
}
