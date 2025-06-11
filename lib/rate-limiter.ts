import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

export class RateLimiter {
  static async checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const identifier = `user:${userId}`;
    const result = await rateLimiter.limit(identifier);

    return {
      allowed: result.success,
      remaining: result.remaining,
    };
  }
}
