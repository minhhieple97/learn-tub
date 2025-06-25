import {
  subscription_plans,
  user_subscriptions,
  subscription_status,
} from '@prisma/client';

export type CreateUserSubscriptionData = {
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: subscription_status;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
};

export type UpdateUserSubscriptionData = {
  status?: subscription_status;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
};

export type UpsertUserSubscriptionData = {
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: subscription_status;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
}; 