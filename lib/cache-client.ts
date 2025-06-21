/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_CREDITS: (userId: string) => `user:credits:${userId}`,
  USER_SUBSCRIPTION: (userId: string) => `user:subscription:${userId}`,
  SUBSCRIPTION_PLANS: "subscription:plans",
} as const;

const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  USER_CREDITS: 180, // 3 minutes
  USER_SUBSCRIPTION: 600, // 10 minutes
  SUBSCRIPTION_PLANS: 1800, // 30 minutes
} as const;

export class CacheClient {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T, ttl: number): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  static async del(key: string | string[]): Promise<boolean> {
    try {
      if (Array.isArray(key)) {
        await redis.del(...key);
      } else {
        await redis.del(key);
      }
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  static async getUserProfile<T>(userId: string): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.USER_PROFILE(userId));
  }

  static async setUserProfile<T>(userId: string, profile: T): Promise<boolean> {
    return this.set(
      CACHE_KEYS.USER_PROFILE(userId),
      profile,
      CACHE_TTL.USER_PROFILE,
    );
  }

  static async invalidateUserProfile(userId: string): Promise<boolean> {
    return this.del(CACHE_KEYS.USER_PROFILE(userId));
  }

  static async getUserCredits(userId: string): Promise<number | null> {
    return this.get<number>(CACHE_KEYS.USER_CREDITS(userId));
  }

  static async setUserCredits(
    userId: string,
    credits: number,
  ): Promise<boolean> {
    return this.set(
      CACHE_KEYS.USER_CREDITS(userId),
      credits,
      CACHE_TTL.USER_CREDITS,
    );
  }

  static async invalidateUserCredits(userId: string): Promise<boolean> {
    return this.del(CACHE_KEYS.USER_CREDITS(userId));
  }

  static async getUserSubscription<T>(userId: string): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.USER_SUBSCRIPTION(userId));
  }

  static async setUserSubscription<T>(
    userId: string,
    subscription: T,
  ): Promise<boolean> {
    return this.set(
      CACHE_KEYS.USER_SUBSCRIPTION(userId),
      subscription,
      CACHE_TTL.USER_SUBSCRIPTION,
    );
  }

  static async invalidateUserSubscription(userId: string): Promise<boolean> {
    return this.del(CACHE_KEYS.USER_SUBSCRIPTION(userId));
  }

  static async getSubscriptionPlans<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.SUBSCRIPTION_PLANS);
  }

  static async setSubscriptionPlans<T>(plans: T): Promise<boolean> {
    return this.set(
      CACHE_KEYS.SUBSCRIPTION_PLANS,
      plans,
      CACHE_TTL.SUBSCRIPTION_PLANS,
    );
  }

  static async invalidateSubscriptionPlans(): Promise<boolean> {
    return this.del(CACHE_KEYS.SUBSCRIPTION_PLANS);
  }

  static async invalidateUserCache(userId: string): Promise<boolean> {
    const keys = [
      CACHE_KEYS.USER_PROFILE(userId),
      CACHE_KEYS.USER_CREDITS(userId),
      CACHE_KEYS.USER_SUBSCRIPTION(userId),
    ];
    return this.del(keys);
  }

  static async warmUserCache(
    userId: string,
    profile: any,
    credits: number,
    subscription: any,
  ): Promise<void> {
    await Promise.all([
      this.setUserProfile(userId, profile),
      this.setUserCredits(userId, credits),
      this.setUserSubscription(userId, subscription),
    ]);
  }
}
