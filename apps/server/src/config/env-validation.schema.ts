import Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: Joi.string().required(),
  UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  // Cache
  CACHE_TTL: Joi.number().default(300),
}); 