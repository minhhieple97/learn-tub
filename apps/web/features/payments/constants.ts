import { IPricingData } from "./types";

export const USER_SUBSCRIPTION_QUERY_KEY = "user-subscription";
export const USER_SUBSCRIPTION_QUERY_URL = "/api/user/subscription";

export const PLAN_ID_MAPPING = {
  FREE: "207cd634-648a-44a3-982a-5605ef25fb7c",
  PRO: "b06b6ec8-6a58-4035-9f5c-a281a7aa8e10",
  PREMIUM: "c2a6edeb-a5aa-4c2a-aa3f-e810c44962f4",
} as const;

export const CREDIT_PACKAGES = {
  CREDITS_100: {
    id: "2cda6e65-5d13-4038-ad13-6fae26dd4fa2",
    name: "100 Credits Package",
    stripe_product_id: "prod_SXUn0QcGHtWXp2",
    stripe_price_id: "price_1RcPo9ISq0Ei8V9buvaGh8yr",
    credits: 100,
    price_cents: 20,
    price_display: "$0.20",
  },
} as const;

export const PRICING_DATA: IPricingData = {
  plans: [
    {
      id: "FREE",
      name: "Free",
      price: "$0",
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-blue-600",
      productId: null,
    },
    {
      id: "PRO",
      name: "Pro",
      price: "$2",
      color: "text-indigo-600 dark:text-indigo-400",
      gradient: "from-indigo-500 to-purple-600",
      productId: "prod_SVCVKAQ94lH5CT",
    },
  ],
  features: [
    {
      name: "AI Credits",
      values: ["50 credits/month", "500 credits/month"],
    },
    {
      name: "Note Taking",
      values: ["Unlimited", "Unlimited"],
    },
    {
      name: "AI Analysis",
      values: ["Basic", "Advanced"],
    },
    {
      name: "Support",
      values: ["Email", "Priority"],
    },
    {
      name: "Export",
      values: [false, true],
    },
  ],
};

export const STRIPE_SUBSCRIPTION_STATUS = {
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  TRIALING: "trialing",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  UNPAID: "unpaid",
  PAUSED: "paused",
} as const;

export const STRIPE_BILLING_REASON = {
  AUTOMATIC_PENDING_INVOICE_ITEM_INVOICE:
    "automatic_pending_invoice_item_invoice",
  MANUAL: "manual",
  QUOTE_ACCEPT: "quote_accept",
  SUBSCRIPTION: "subscription",
  SUBSCRIPTION_CREATE: "subscription_create",
  SUBSCRIPTION_CYCLE: "subscription_cycle",
  SUBSCRIPTION_THRESHOLD: "subscription_threshold",
  SUBSCRIPTION_UPDATE: "subscription_update",
  UPCOMING: "upcoming",
} as const;

export const STRIPE_INVOICE_STATUS = {
  DRAFT: "draft",
  OPEN: "open",
  PAID: "paid",
  UNCOLLECTIBLE: "uncollectible",
  VOID: "void",
} as const;

export const WEBHOOK_EVENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  RETRYING: "retrying",
  CANCELLED: "cancelled",
} as const;

export const WEBHOOK_QUEUE_NAMES = {
  STRIPE_WEBHOOKS: "stripe-webhooks",
  STRIPE_WEBHOOKS_DLQ: "stripe-webhooks-dlq",
} as const;

export const WEBHOOK_JOB_PRIORITIES = {
  HIGH: 100,
  NORMAL: 50,
  LOW: 10,
} as const;

export const WEBHOOK_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 5000, // 5 seconds
  MAX_DELAY: 300000, // 5 minutes
  BACKOFF_MULTIPLIER: 2,
} as const;

export const WEBHOOK_JOB_OPTIONS = {
  removeOnComplete: 50,
  removeOnFail: 100,
  attempts: WEBHOOK_RETRY_CONFIG.MAX_ATTEMPTS,
  backoff: {
    type: "exponential" as const,
    delay: WEBHOOK_RETRY_CONFIG.INITIAL_DELAY,
  },
} as const;

export const TIME_CONSTANTS = {
  MILLISECONDS_IN_DAY: 1000 * 60 * 60 * 24,
} as const;

export const POSTGRES_ERROR_CODES = {
  NO_ROWS_FOUND: "PGRST116",
} as const;
