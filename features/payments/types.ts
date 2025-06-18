import { z } from 'zod';
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

export type IUserCredits = {
  id: string;
  user_id: string;
  credits_available: number;
  credits_used_this_month: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
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

export type ICreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionSchema
>;
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
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  subscription_plans: {
    id: string;
    name: string;
    credits_per_month: number;
  };
};
