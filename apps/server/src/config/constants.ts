export const PAYMENT_CONFIG = {
  MODES: {
    SUBSCRIPTION: 'subscription',
    PAYMENT: 'payment',
  },
  TYPES: {
    SUBSCRIPTION: 'subscription',
    CREDITS: 'credits',
  },
} as const;

export const CREDIT_CONFIG = {
  EXPIRATION: {
    SUBSCRIPTION_DAYS: 30,
    PURCHASE_DAYS: 365,
  },
  BUCKET: {
    STATUS: {
      ACTIVE: 'active',
      EXHAUSTED: 'exhausted',
      EXPIRED: 'expired',
      CANCELLED: 'cancelled',
    },
  },
  SOURCE: {
    TYPES: {
      SUBSCRIPTION: 'subscription',
      PURCHASE: 'purchase',
      BONUS: 'bonus',
      GIFT: 'gift',
      REFUND: 'refund',
      ADMIN_ADJUSTMENT: 'admin_adjustment',
      REFERRAL_BONUS: 'referral_bonus',
      PROMOTIONAL: 'promotional',
      COMPENSATION: 'compensation',
      CANCELLED_PLAN: 'cancelled_plan',
    },
  },
} as const;

export const TRANSACTION_CONFIG = {
  TYPES: {
    MONTHLY_RESET: 'monthly_reset',
    PURCHASE: 'purchase',
    EVALUATE_NOTE: 'evaluate_note',
    GENERATE_QUIZ_QUESTIONS: 'generate_quizz_questions',
    EVALUATE_QUIZ_ANSWERS: 'evaluate_quizz_answers',
    REFUND: 'refund',
    BONUS: 'bonus',
    SUBSCRIPTION_GRANT: 'subscription_grant',
    ADMIN_ADJUSTMENT: 'admin_adjustment',
    SWITCH_PLAN: 'switch_plan',
  },
} as const;

export const SUBSCRIPTION_CONFIG = {
  STATUS: {
    ACTIVE: 'active',
    EXHAUSTED: 'exhausted',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },
} as const;

export const WEBHOOK_CONFIG = {
  EVENTS: {
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
    CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
    INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    INVOICE_PAID: 'invoice.paid',
  },
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    RETRYING: 'retrying',
    CANCELLED: 'cancelled',
  },
} as const;

export const QUEUE_CONFIG = {
  NAMES: {
    WEBHOOK_PROCESSING: 'webhook-processing',
    CREDIT_MAINTENANCE: 'credit-maintenance',
    SUBSCRIPTION_MAINTENANCE: 'subscription-maintenance',
  },
  JOB_NAMES: {
    WEBHOOK_STRIPE: 'webhook-stripe',
    WEBHOOK_STRIPE_CLEANUP: 'webhook-stripe-cleanup',
  },
  OPTIONS: {
    DEFAULT_JOB_OPTIONS: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  },
} as const;
