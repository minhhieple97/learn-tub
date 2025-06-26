export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_CREDITS: (userId: string) => `user:credits:${userId}`,
  USER_SUBSCRIPTION: (userId: string) => `user:subscription:${userId}`,
  SUBSCRIPTION_PLANS: 'subscription:plans',
  ALL_USERS: 'user:*',
} as const;

export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  USER_CREDITS: 180, // 3 minutes
  USER_SUBSCRIPTION: 600, // 10 minutes
  SUBSCRIPTION_PLANS: 1800, // 30 minutes
} as const;

export type CacheKey = keyof typeof CACHE_KEYS;
export type CacheTTL = keyof typeof CACHE_TTL;
