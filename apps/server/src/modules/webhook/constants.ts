export const STRIPE_BILLING_REASON = {
  SUBSCRIPTION_CYCLE: 'subscription_cycle',
  SUBSCRIPTION_CREATE: 'subscription_create',
  SUBSCRIPTION_UPDATE: 'subscription_update',
} as const;

// This should be configured via env vars, but using a placeholder for now.
export const PLAN_ID_MAPPING = {
  FREE:'f3a4b5c6-7890-1234-abcd-efgh12345678',
};
