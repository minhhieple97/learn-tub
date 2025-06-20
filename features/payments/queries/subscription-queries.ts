import { createClient } from '@/lib/supabase/server';
import { IUserSubscriptionStatus } from '../types';
import { USER_SUBSCRIPTION_STATUS } from '@/config/constants';

export async function getSubscriptionPlan(stripeProductId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('stripe_product_id', stripeProductId)
    .eq('is_active', true)
    .single();

  return { data, error };
}

export async function getSubscriptionPlanById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  return { data, error };
}

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return { data, error };
}

export async function getUserStripeCustomerId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function getUserByStripeCustomerId(customerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id')
    .eq('stripe_customer_id', customerId)
    .single();

  return { data, error };
}

export async function upsertUserSubscription(userId: string, planId: string, subscription: any) {
  const supabase = await createClient();

  // Extract period dates from the first subscription item (where they're actually located)
  const firstItem = subscription.items?.data?.[0];
  const currentPeriodStart = firstItem?.current_period_start || subscription.current_period_start;
  const currentPeriodEnd = firstItem?.current_period_end || subscription.current_period_end;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: USER_SUBSCRIPTION_STATUS.ACTIVE,
      current_period_start: currentPeriodStart
        ? new Date(currentPeriodStart * 1000).toISOString()
        : null,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    })
    .select();

  return { data, error };
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: IUserSubscriptionStatus,
  periodStart?: number,
  periodEnd?: number,
  cancelAtPeriodEnd?: boolean,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : undefined,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : undefined,
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    .eq('stripe_subscription_id', subscriptionId)
    .select();

  return { data, error };
}

export async function getPlanByStripePrice(priceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id', priceId)
    .eq('is_active', true)
    .single();

  return { data, error };
}

export async function createPaymentHistory(
  userId: string,
  amountCents: number,
  currency: string,
  paymentType: string,
  status: 'completed' | 'failed',
  description: string,
  stripePaymentIntentId?: string,
  stripeInvoiceId?: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('payment_history').insert({
    user_id: userId,
    amount_cents: amountCents,
    currency,
    payment_type: paymentType,
    status,
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_invoice_id: stripeInvoiceId,
    description,
  });

  return { data, error };
}

export async function getUserActiveSubscription(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      subscription_plans (
        id,
        name,
        price_cents,
        credits_per_month,
        stripe_price_id,
        stripe_product_id
      )
    `,
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('current_period_end', now)
    .single();

  return { data, error };
}

export async function checkUserHasActivePlan(userId: string, planId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .lte('current_period_start', now)
    .gte('current_period_end', now)
    .single();

  return {
    hasActivePlan: !!data && !error,
    error: error?.code === 'PGRST116' ? null : error,
  };
}

export async function checkUserHasAnyActiveSubscription(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id, plan_id, current_period_start, current_period_end')
    .eq('user_id', userId)
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .lte('current_period_start', now)
    .gte('current_period_end', now)
    .single();

  return {
    hasActiveSubscription: !!data && !error,
    subscription: data,
    error: error?.code === 'PGRST116' ? null : error,
  };
}
