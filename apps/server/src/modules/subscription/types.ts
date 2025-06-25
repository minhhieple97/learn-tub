import { Prisma, subscription_status } from '@prisma/client';

export type ICreateUserSubscriptionData = {
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: subscription_status;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
};

export type IUpdateUserSubscriptionData = {
  status?: subscription_status;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
};

export type IUpsertUserSubscriptionData = {
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: subscription_status;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
};

export type ISubscriptionData = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status?: any;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export type IUserSubscriptionWithPlan = Prisma.user_subscriptionsGetPayload<{
  include: {
    subscription_plans: true;
  };
}>;
