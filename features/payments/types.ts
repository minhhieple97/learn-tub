import { z } from 'zod';
import type {
  CREDIT_SOURCE_TYPES,
  CREDIT_BUCKET_STATUS,
  USER_SUBSCRIPTION_STATUS,
} from '@/config/constants';
import type {
  STRIPE_SUBSCRIPTION_STATUS,
  STRIPE_BILLING_REASON,
  STRIPE_INVOICE_STATUS,
} from './constants';
import {
  CancelSubscriptionSchema,
  CreateCheckoutSessionSchema,
  PurchaseCreditsSchema,
  UpdateSubscriptionSchema,
} from './schemas';

export type ISubscriptionPlan = {
  id: string;
  name: string;
  stripe_product_id: string;
  stripe_price_id: string;
  price_cents: number;
  credits_per_month: number;
  features: {
    features: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type IUserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: ISubscriptionPlan;
};

export type ICreditBucket = {
  id: string;
  user_id: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number | null;
  source_type: ICreditSourceType;
  status: ICreditBucketStatus;
  description: string | null;
  expires_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ICreditTransaction = {
  id: string;
  user_id: string;
  type: 'purchase' | 'monthly_reset' | 'usage' | 'refund';
  amount: number;
  description: string | null;
  stripe_payment_intent_id: string | null;
  related_action_id: string | null;
  created_at: string;
};

export type IPaymentHistory = {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  payment_type: 'subscription' | 'credits' | 'one_time';
  description: string | null;
  created_at: string;
};

export type ICreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
export type IPurchaseCreditsInput = z.infer<typeof PurchaseCreditsSchema>;
export type ICancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;
export type IUpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;

export type IPaymentDetails = {
  amount: number;
  currency: string;
  paymentType: 'subscription' | 'credits';
  planName?: string;
  creditsAmount?: number;
};

export type ICreditResetResult = {
  userId: string;
  subscriptionReset: boolean;
  purchaseReset: boolean;
  creditsGranted: number;
  error?: string;
};

export type ICreditResetSummary = {
  totalProcessed: number;
  successfulResets: number;
  errors: string[];
  subscriptionResetsCount: number;
  purchaseResetsCount: number;
  totalCreditsGranted: number;
};

export type IUserWithSubscription = {
  user_id: string;
  plan_id: string;
  status: IUserSubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  subscription_plans: {
    id: string;
    name: string;
    credits_per_month: number;
  };
};

export type IPricingPlan = {
  id: string;
  name: string;
  price: string;
  color: string;
  gradient: string;
  productId: string | null;
};

export type IPricingFeature = {
  name: string;
  values: (string | boolean)[];
};

export type IPricingData = {
  plans: IPricingPlan[];
  features: IPricingFeature[];
};

export type ICreditSourceType = (typeof CREDIT_SOURCE_TYPES)[keyof typeof CREDIT_SOURCE_TYPES];
export type ICreditBucketStatus = (typeof CREDIT_BUCKET_STATUS)[keyof typeof CREDIT_BUCKET_STATUS];
export type IUserSubscriptionStatus =
  (typeof USER_SUBSCRIPTION_STATUS)[keyof typeof USER_SUBSCRIPTION_STATUS];

// Stripe constants types
export type IStripeSubscriptionStatus =
  (typeof STRIPE_SUBSCRIPTION_STATUS)[keyof typeof STRIPE_SUBSCRIPTION_STATUS];
export type IStripeBillingReason =
  (typeof STRIPE_BILLING_REASON)[keyof typeof STRIPE_BILLING_REASON];
export type IStripeInvoiceStatus =
  (typeof STRIPE_INVOICE_STATUS)[keyof typeof STRIPE_INVOICE_STATUS];

export type IUserSubscriptionResponse = {
  subscription: {
    id: string;
    plan_id: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
    subscription_plans: {
      id: string;
      name: string;
      price_cents: number;
      credits_per_month: number;
      stripe_price_id: string;
      stripe_product_id: string;
    };
  } | null;
  hasActiveSubscription: boolean;
};

export type ISubscriptionData = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  status?: IUserSubscriptionStatus;
};

export type IStripeAutomaticTax = {
  enabled: boolean;
  liability: string | null;
  status: string | null;
};

export type IStripeIssuer = {
  type: string;
};

export type IStripeInvoiceLines = {
  object: string;
  data: any[];
  has_more: boolean;
  total_count: number;
  url: string;
};

export type IStripePaymentSettings = {
  default_mandate: string | null;
  payment_method_options: any | null;
  payment_method_types: string[] | null;
};

export type IStripeStatusTransitions = {
  finalized_at: number | null;
  marked_uncollectible_at: number | null;
  paid_at: number | null;
  voided_at: number | null;
};

export type IStripeInvoice = {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  account_tax_ids: string[] | null;
  amount_due: number;
  amount_paid: number;
  amount_overpaid: number;
  amount_remaining: number;
  amount_shipping: number;
  application: string | null;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  automatic_tax: IStripeAutomaticTax;
  billing_reason: IStripeBillingReason;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: any[] | null;
  customer: string;
  customer_address: any | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_shipping: any | null;
  customer_tax_exempt: string;
  customer_tax_ids: any[];
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discounts: any[];
  due_date: number | null;
  ending_balance: number;
  footer: string | null;
  from_invoice: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  issuer: IStripeIssuer;
  last_finalization_error: any | null;
  latest_revision: string | null;
  lines: IStripeInvoiceLines;
  livemode: boolean;
  metadata: Record<string, any>;
  next_payment_attempt: number | null;
  number: string | null;
  on_behalf_of: string | null;
  parent: {
    quote_details: any | null;
    subscription_details: {
      metadata: Record<string, any>;
      subscription: string;
    } | null;
    type: string;
  } | null;
  payment_settings: IStripePaymentSettings;
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  receipt_number: string | null;
  shipping_cost: any | null;
  shipping_details: any | null;
  starting_balance: number;
  statement_descriptor: string | null;
  status: IStripeInvoiceStatus;
  status_transitions: IStripeStatusTransitions;
  subtotal: number;
  subtotal_excluding_tax: number;
  test_clock: string | null;
  total: number;
  total_discount_amounts: any[];
  total_excluding_tax: number;
  total_taxes: any[];
  webhooks_delivered_at: number | null;
};

export type IStripeCancellationDetails = {
  comment: string | null;
  feedback: string | null;
  reason: string | null;
};

export type IStripeInvoiceSettings = {
  issuer: IStripeIssuer;
};

export type IStripeRecurring = {
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days: number | null;
  usage_type: 'licensed' | 'metered';
};

export type IStripePlan = {
  id: string;
  object: string;
  active: boolean;
  amount: number;
  amount_decimal: string;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  discounts: any[] | null;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, any>;
  nickname: string | null;
  product: string;
  tiers_mode: string | null;
  transform_usage: any | null;
  trial_period_days: number | null;
  usage_type: 'licensed' | 'metered';
};

export type IStripePrice = {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  custom_unit_amount: any | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, any>;
  nickname: string | null;
  product: string;
  recurring: IStripeRecurring | null;
  tax_behavior: 'unspecified' | 'inclusive' | 'exclusive';
  tiers_mode: string | null;
  transform_quantity: any | null;
  type: 'one_time' | 'recurring';
  unit_amount: number | null;
  unit_amount_decimal: string | null;
};

export type IStripeSubscriptionItem = {
  id: string;
  object: string;
  created: number;
  current_period_end: number;
  current_period_start: number;
  metadata: Record<string, any>;
  plan: IStripePlan;
  price: IStripePrice;
  quantity: number;
  subscription: string;
  tax_rates: any[];
};

export type IStripeSubscriptionItems = {
  object: string;
  data: IStripeSubscriptionItem[];
  has_more: boolean;
  total_count: number;
  url: string;
};

export type IStripeSubscriptionPaymentSettings = {
  payment_method_options: any | null;
  payment_method_types: string[] | null;
  save_default_payment_method: 'off' | 'on_subscription';
};

export type IStripeTrialSettings = {
  end_behavior: {
    missing_payment_method: 'create_invoice' | 'pause';
  };
};

export type IStripeSubscription = {
  id: string;
  object: string;
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    enabled: boolean;
    liability: any | null;
  };
  billing_cycle_anchor: number;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: IStripeCancellationDetails;
  collection_method: 'charge_automatically' | 'send_invoice';
  created: number;
  currency: string;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discounts: any[] | null;
  ended_at: number | null;
  invoice_settings: IStripeInvoiceSettings;
  items: IStripeSubscriptionItems;
  latest_invoice: string | null;
  livemode: boolean;
  metadata: Record<string, any>;
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: any | null;
  payment_settings: IStripeSubscriptionPaymentSettings;
  pending_invoice_item_interval: any | null;
  pending_setup_intent: string | null;
  pending_update: any | null;
  schedule: string | null;
  start_date: number;
  status: IStripeSubscriptionStatus;
  test_clock: string | null;
  transfer_data: any | null;
  trial_end: number | null;
  trial_settings: IStripeTrialSettings | null;
  trial_start: number | null;
};

