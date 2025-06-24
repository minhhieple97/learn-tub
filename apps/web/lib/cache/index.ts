export { CacheClient } from "../cache-client";
export { CacheService } from "../cache-service";

export {
  invalidateUserCacheOnCreditChange,
  invalidateUserCacheOnSubscriptionChange,
  invalidateMultipleUsersCacheOnCreditChange,
  invalidateMultipleUsersCacheOnSubscriptionChange,
  invalidateAllUserCache,
  invalidateUserCacheOnDeduction,
} from "../../features/payments/queries";

export const CACHE_CONFIG = {
  TTL: {
    USER_PROFILE: 300, // 5 minutes
    USER_CREDITS: 180, // 3 minutes
    USER_SUBSCRIPTION: 600, // 10 minutes
    SUBSCRIPTION_PLANS: 1800, // 30 minutes
  },
  KEYS: {
    USER_PROFILE: (userId: string) => `user:profile:${userId}`,
    USER_CREDITS: (userId: string) => `user:credits:${userId}`,
    USER_SUBSCRIPTION: (userId: string) => `user:subscription:${userId}`,
    SUBSCRIPTION_PLANS: "subscription:plans",
  },
} as const;
