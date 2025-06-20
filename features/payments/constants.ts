import { IPricingData } from './types';

export const USER_SUBSCRIPTION_QUERY_KEY = 'user-subscription';
export const USER_SUBSCRIPTION_QUERY_URL = '/api/user/subscription';

export const PLAN_ID_MAPPING: Record<string, string> = {
  FREE: '207cd634-648a-44a3-982a-5605ef25fb7c',
  PRO: 'b06b6ec8-6a58-4035-9f5c-a281a7aa8e10',
  PREMIUM: 'c2a6edeb-a5aa-4c2a-aa3f-e810c44962f4',
};

export const PRICING_DATA: IPricingData = {
  plans: [
    {
      id: 'FREE',
      name: 'Free',
      price: '$0',
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
      productId: null,
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '$2',
      color: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-purple-600',
      productId: 'prod_SVCVKAQ94lH5CT',
    },
  ],
  features: [
    {
      name: 'AI Credits',
      values: ['50 credits/month', '500 credits/month'],
    },
    {
      name: 'Note Taking',
      values: ['Unlimited', 'Unlimited'],
    },
    {
      name: 'AI Analysis',
      values: ['Basic', 'Advanced'],
    },
    {
      name: 'Support',
      values: ['Email', 'Priority'],
    },
    {
      name: 'Export',
      values: [false, true],
    },
  ],
};

export const STRIPE_SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  PAUSED: 'paused',
} as const;

export const STRIPE_BILLING_REASON = {
  AUTOMATIC_PENDING_INVOICE_ITEM_INVOICE: 'automatic_pending_invoice_item_invoice',
  MANUAL: 'manual',
  QUOTE_ACCEPT: 'quote_accept',
  SUBSCRIPTION: 'subscription',
  SUBSCRIPTION_CREATE: 'subscription_create',
  SUBSCRIPTION_CYCLE: 'subscription_cycle',
  SUBSCRIPTION_THRESHOLD: 'subscription_threshold',
  SUBSCRIPTION_UPDATE: 'subscription_update',
  UPCOMING: 'upcoming',
} as const;

export const STRIPE_INVOICE_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  PAID: 'paid',
  UNCOLLECTIBLE: 'uncollectible',
  VOID: 'void',
} as const;

