import {
  credit_bucket_status_enum,
  credit_source_type_enum,
  transaction_type_enum,
} from '@prisma/client';

export type CreateCreditBucketData = {
  user_id: string;
  credits_total: number;
  credits_used?: number;
  credits_remaining: number;
  source_type: credit_source_type_enum;
  status: credit_bucket_status_enum;
  description: string | null;
  expires_at: Date | null;
  metadata?: any;
  user_subscription_id?: string | null;
};

export type CreateCreditTransactionData = {
  user_id: string;
  amount: number;
  type: transaction_type_enum;
  description: string;
  related_action_id?: string;
  stripe_payment_intent_id?: string;
};

export type CreateCreditBucketDto = {
  userId: string;
  creditsTotal: number;
  sourceType: credit_source_type_enum;
  description: string | null;
  expiresAt: Date | null;
  metadata?: Record<string, any> | null;
  userSubscriptionId?: string | null;
};

export type CreateCreditTransactionDto = {
  userId: string;
  amount: number;
  type: transaction_type_enum;
  description: string;
  relatedActionId?: string;
  stripePaymentIntentId?: string;
}; 