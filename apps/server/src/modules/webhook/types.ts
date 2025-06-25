import { Prisma } from "@prisma/client";
import { webhook_event_status, webhook_event_type } from '@prisma/client';

export interface IStripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface IStripeSubscription {
  id: string;
  customer: string;
  status: string;
  cancel_at_period_end?: boolean;
  items?: {
    data?: Array<{
      price?: {
        id: string;
      };
      current_period_start?: number;
      current_period_end?: number;
    }>;
  };
  metadata?: Record<string, string>;
  latest_invoice?: string;
}

export interface IStripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  billing_reason?: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  period_start: number;
  period_end: number;
  metadata?: Record<string, string>;
  payment_intent?: string;
  parent?: {
    subscription_details?: {
      subscription: string;
    };
  };
}

export interface ISubscriptionData {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status?: any;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export type UserSubscriptionWithPlan = Prisma.user_subscriptionsGetPayload<{
  include: {
    subscription_plans: true;
  };
}>;

export type CreateWebhookEventData = {
  stripe_event_id: string;
  event_type: webhook_event_type;
  status: webhook_event_status;
  raw_payload: any;
  max_attempts: number;
  attempts: number;
};

export type CreateWebhookJobData = {
  webhook_event_id: string;
  job_id: string;
  queue_name: string;
  priority: number;
  delay_ms: number;
};

export type UpdateWebhookEventData = {
  status?: webhook_event_status;
  error_message?: string | null;
  attempts?: { increment: number } | number;
};
