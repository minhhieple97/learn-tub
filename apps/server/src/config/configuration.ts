export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300,
  },

  // Payment configuration
  payment: {
    modes: {
      subscription: 'subscription',
      payment: 'payment',
    },
    types: {
      subscription: 'subscription',
      credits: 'credits',
    },
  },

  // Credit configuration
  credit: {
    expiration: {
      subscriptionDays: 30,
      purchaseDays: 365,
    },
    bucket: {
      status: {
        active: 'active',
        exhausted: 'exhausted',
        expired: 'expired',
        cancelled: 'cancelled',
      },
    },
    source: {
      types: {
        subscription: 'subscription',
        purchase: 'purchase',
        bonus: 'bonus',
        gift: 'gift',
        refund: 'refund',
        adminAdjustment: 'admin_adjustment',
        referralBonus: 'referral_bonus',
        promotional: 'promotional',
        compensation: 'compensation',
        cancelledPlan: 'cancelled_plan',
      },
    },
  },

  // Transaction types
  transaction: {
    types: {
      monthlyReset: 'monthly_reset',
      purchase: 'purchase',
      evaluateNote: 'evaluate_note',
      generateQuizQuestions: 'generate_quizz_questions',
      evaluateQuizAnswers: 'evaluate_quizz_answers',
      refund: 'refund',
      bonus: 'bonus',
      subscriptionGrant: 'subscription_grant',
      adminAdjustment: 'admin_adjustment',
      switchPlan: 'switch_plan',
    },
  },

  // Subscription configuration
  subscription: {
    status: {
      active: 'active',
      exhausted: 'exhausted',
      expired: 'expired',
      cancelled: 'cancelled',
    },
  },

  // Webhook configuration
  webhook: {
    events: {
      checkoutSessionCompleted: 'checkout.session.completed',
      customerSubscriptionCreated: 'customer.subscription.created',
      customerSubscriptionUpdated: 'customer.subscription.updated',
      customerSubscriptionDeleted: 'customer.subscription.deleted',
      invoicePaymentSucceeded: 'invoice.payment_succeeded',
      invoicePaymentFailed: 'invoice.payment_failed',
      invoicePaid: 'invoice.paid',
    },
    status: {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
      retrying: 'retrying',
      cancelled: 'cancelled',
    },
  },

  // Queue configuration
  queue: {
    names: {
      webhookProcessing: 'webhook-processing',
      creditMaintenance: 'credit-maintenance',
      subscriptionMaintenance: 'subscription-maintenance',
    },
    options: {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    },
  },
});
