import { Injectable, Logger } from '@nestjs/common';
import { CacheClientService } from './cache-client.service';
import { CACHE_KEYS, CACHE_TTL } from './cache.constants';

export type ICacheInvalidationResult = {
  success: boolean;
  error?: string;
};

export type IUserData = {
  profile?: any;
  credits?: number;
  subscription?: any;
};

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly cacheClient: CacheClientService) {}

  async getUserProfile<T>(userId: string): Promise<T | null> {
    return this.cacheClient.get<T>(CACHE_KEYS.USER_PROFILE(userId));
  }

  async setUserProfile<T>(userId: string, profile: T): Promise<boolean> {
    return this.cacheClient.set(CACHE_KEYS.USER_PROFILE(userId), profile, {
      ttl: CACHE_TTL.USER_PROFILE,
    });
  }

  async invalidateUserProfile(
    userId: string,
  ): Promise<ICacheInvalidationResult> {
    try {
      const success = await this.cacheClient.del(
        CACHE_KEYS.USER_PROFILE(userId),
      );
      if (success) {
        this.logger.log(`Invalidated user profile cache for user: ${userId}`);
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user profile cache for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserCredits(userId: string): Promise<number | null> {
    return this.cacheClient.get<number>(CACHE_KEYS.USER_CREDITS(userId));
  }

  async setUserCredits(userId: string, credits: number): Promise<boolean> {
    return this.cacheClient.set(CACHE_KEYS.USER_CREDITS(userId), credits, {
      ttl: CACHE_TTL.USER_CREDITS,
    });
  }

  async invalidateUserCredits(
    userId: string,
  ): Promise<ICacheInvalidationResult> {
    try {
      const success = await this.cacheClient.del(
        CACHE_KEYS.USER_CREDITS(userId),
      );
      if (success) {
        this.logger.log(`Invalidated user credits cache for user: ${userId}`);
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user credits cache for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserSubscription<T>(userId: string): Promise<T | null> {
    return this.cacheClient.get<T>(CACHE_KEYS.USER_SUBSCRIPTION(userId));
  }

  async setUserSubscription<T>(
    userId: string,
    subscription: T,
  ): Promise<boolean> {
    return this.cacheClient.set(
      CACHE_KEYS.USER_SUBSCRIPTION(userId),
      subscription,
      { ttl: CACHE_TTL.USER_SUBSCRIPTION },
    );
  }

  async invalidateUserSubscription(
    userId: string,
  ): Promise<ICacheInvalidationResult> {
    try {
      const success = await this.cacheClient.del(
        CACHE_KEYS.USER_SUBSCRIPTION(userId),
      );
      if (success) {
        this.logger.log(
          `Invalidated user subscription cache for user: ${userId}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user subscription cache for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSubscriptionPlans<T>(): Promise<T | null> {
    return this.cacheClient.get<T>(CACHE_KEYS.SUBSCRIPTION_PLANS);
  }

  async setSubscriptionPlans<T>(plans: T): Promise<boolean> {
    return this.cacheClient.set(CACHE_KEYS.SUBSCRIPTION_PLANS, plans, {
      ttl: CACHE_TTL.SUBSCRIPTION_PLANS,
    });
  }

  async invalidateSubscriptionPlans(): Promise<ICacheInvalidationResult> {
    try {
      const success = await this.cacheClient.del(CACHE_KEYS.SUBSCRIPTION_PLANS);
      if (success) {
        this.logger.log('Invalidated subscription plans cache');
      }
      return { success };
    } catch (error) {
      this.logger.error('Failed to invalidate subscription plans cache', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateUserCache(userId: string): Promise<ICacheInvalidationResult> {
    try {
      const keys = [
        CACHE_KEYS.USER_PROFILE(userId),
        CACHE_KEYS.USER_CREDITS(userId),
        CACHE_KEYS.USER_SUBSCRIPTION(userId),
      ];

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(`Invalidated all cache for user: ${userId}`);
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user cache for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateMultipleUsersCache(
    userIds: string[],
  ): Promise<ICacheInvalidationResult> {
    try {
      if (userIds.length === 0) {
        return { success: true };
      }

      const keys: string[] = [];
      userIds.forEach((userId) => {
        keys.push(
          CACHE_KEYS.USER_PROFILE(userId),
          CACHE_KEYS.USER_CREDITS(userId),
          CACHE_KEYS.USER_SUBSCRIPTION(userId),
        );
      });

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(
          `Invalidated cache for ${userIds.length} users: ${userIds.join(', ')}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for multiple users: ${userIds.join(', ')}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateUserCacheOnCreditChange(
    userId: string,
  ): Promise<ICacheInvalidationResult> {
    try {
      const keys = [
        CACHE_KEYS.USER_PROFILE(userId),
        CACHE_KEYS.USER_CREDITS(userId),
      ];

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(
          `Invalidated user cache on credit change for user: ${userId}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user cache on credit change for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateUserCacheOnSubscriptionChange(
    userId: string,
  ): Promise<ICacheInvalidationResult> {
    try {
      const keys = [
        CACHE_KEYS.USER_PROFILE(userId),
        CACHE_KEYS.USER_SUBSCRIPTION(userId),
      ];

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(
          `Invalidated user cache on subscription change for user: ${userId}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user cache on subscription change for user: ${userId}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateMultipleUsersCacheOnCreditChange(
    userIds: string[],
  ): Promise<ICacheInvalidationResult> {
    try {
      if (userIds.length === 0) {
        return { success: true };
      }

      const keys: string[] = [];
      userIds.forEach((userId) => {
        keys.push(
          CACHE_KEYS.USER_PROFILE(userId),
          CACHE_KEYS.USER_CREDITS(userId),
        );
      });

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(
          `Invalidated cache on credit change for ${userIds.length} users: ${userIds.join(', ')}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache on credit change for multiple users: ${userIds.join(', ')}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async invalidateMultipleUsersCacheOnSubscriptionChange(
    userIds: string[],
  ): Promise<ICacheInvalidationResult> {
    try {
      if (userIds.length === 0) {
        return { success: true };
      }

      const keys: string[] = [];
      userIds.forEach((userId) => {
        keys.push(
          CACHE_KEYS.USER_PROFILE(userId),
          CACHE_KEYS.USER_SUBSCRIPTION(userId),
        );
      });

      const success = await this.cacheClient.del(keys);
      if (success) {
        this.logger.log(
          `Invalidated cache on subscription change for ${userIds.length} users: ${userIds.join(', ')}`,
        );
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache on subscription change for multiple users: ${userIds.join(', ')}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Maintenance and utility methods
  async warmUserCache(
    userId: string,
    userData: IUserData,
  ): Promise<ICacheInvalidationResult> {
    try {
      const promises: Promise<boolean>[] = [];

      if (userData.profile) {
        promises.push(this.setUserProfile(userId, userData.profile));
      }

      if (userData.credits !== undefined) {
        promises.push(this.setUserCredits(userId, userData.credits));
      }

      if (userData.subscription) {
        promises.push(this.setUserSubscription(userId, userData.subscription));
      }

      await Promise.all(promises);
      this.logger.log(`Warmed cache for user: ${userId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to warm cache for user: ${userId}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async performCacheMaintenance(): Promise<ICacheInvalidationResult> {
    try {
      // This could be extended for more maintenance tasks
      this.logger.log('Performing cache maintenance...');
      return { success: true };
    } catch (error) {
      this.logger.error('Cache maintenance failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
