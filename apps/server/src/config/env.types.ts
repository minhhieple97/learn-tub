export interface EnvironmentVariables {
  // Application
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Database
  DATABASE_URL: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | 'verbose';

  // Cache
  CACHE_TTL: number;
} 