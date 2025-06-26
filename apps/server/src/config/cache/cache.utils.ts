import { CacheService } from './cache.service';

// Factory function to create cache invalidation functions
export const createCacheInvalidationFunctions = (
  cacheService: CacheService,
) => ({
  // Individual user cache invalidation
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
    logger?: any,
  ): Promise<void> {
    try {
      await invalidateFunction();
      if (logger) {
        logger.log(`🔄 Cache invalidated successfully: ${context}`);
      }
    } catch (error) {
      if (logger) {
        logger.error(`❌ Failed to invalidate cache: ${context}`, error);
      }
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async batchInvalidate(
    invalidationPromises: Promise<any>[],
    context: string,
    logger?: any,
  ): Promise<void> {
    try {
      await Promise.allSettled(invalidationPromises);
      if (logger) {
        logger.log(`🔄 Batch cache invalidation completed: ${context}`);
      }
    } catch (error) {
      if (logger) {
        logger.error(`❌ Batch cache invalidation failed: ${context}`, error);
      }
    }
  }
}
