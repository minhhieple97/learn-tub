import { createClient } from '@/lib/supabase/server';
import { IUserSubscriptionStatus, ISubscriptionData } from '../types';
import { USER_SUBSCRIPTION_STATUS } from '@/config/constants';
import { CacheClient } from '@/lib/cache-client';

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

export async function upsertUserSubscription(
  userId: string,
  planId: string,
  subscriptionData: ISubscriptionData,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId,
      stripe_customer_id: subscriptionData.stripeCustomerId,
      status: subscriptionData.status || USER_SUBSCRIPTION_STATUS.ACTIVE,
      current_period_start: subscriptionData.currentPeriodStart?.toISOString() || null,
      current_period_end: subscriptionData.currentPeriodEnd?.toISOString() || null,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
    })
    .select();

  if (!error && data) {
    await Promise.all([
      CacheClient.invalidateUserSubscription(userId),
      CacheClient.invalidateUserProfile(userId),
    ]);
  }

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

  if (!error && data) {
    const userIds = [...new Set(data.map((sub) => sub.user_id))];
    await Promise.all(
      userIds.map((userId) =>
        Promise.all([
          CacheClient.invalidateUserSubscription(userId),
          CacheClient.invalidateUserProfile(userId),
        ]),
      ),
    );
  }

  return { data, error };
}

export async function getUserActiveSubscription(
  userId: string,
): Promise<{ data: any; error: any }> {
  const cachedSubscription = await CacheClient.getUserSubscription<{ data: any; error: any }>(
    userId,
  );
  if (cachedSubscription) {
    return cachedSubscription;
  }

  // If not cached, fetch from database
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
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .gte('current_period_end', now)
    .maybeSingle();

  const result = { data, error };

  // Cache the subscription data
  if (!error) {
    await CacheClient.setUserSubscription(userId, result);
  }

  return result;
}

export async function getUserSubscriptionWithStatus(userId: string) {
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
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .gte('current_period_end', now)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  // Calculate subscription status details
  const subscription = data;
  const hasActiveSubscription = !!subscription;
  const isCancelled = subscription?.cancel_at_period_end === true;

  let daysRemaining = 0;
  if (subscription?.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    const diffTime = endDate.getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return {
    data: {
      subscription,
      hasActiveSubscription,
      isCancelled,
      daysRemaining,
    },
    error: null,
  };
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

export async function getActiveSubscriptionByStripeIds(
  stripeCustomerId: string,
  stripeSubscriptionId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      subscription_plans (
        id,
        name,
        credits_per_month
      )
    `,
    )
    .eq('stripe_customer_id', stripeCustomerId)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .eq('cancel_at_period_end', false)
    .single();

  return { data, error };
}

export async function expireUserSubscription(subscriptionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      status: USER_SUBSCRIPTION_STATUS.EXPIRED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  return { data, error };
}

export async function createNewUserSubscription(
  userId: string,
  planId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: USER_SUBSCRIPTION_STATUS.ACTIVE,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateSubscriptionCancellation(
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', stripeCustomerId)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .select()
    .single();


  if (!error && data) {
    await Promise.all([
      CacheClient.invalidateUserSubscription(data.user_id),
      CacheClient.invalidateUserProfile(data.user_id),
    ]);
  }

  return { data, error };
}

export async function getUsersWithActiveSubscriptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      user_id,
      plan_id,
      status,
      current_period_end,
      cancel_at_period_end,
      subscription_plans!user_subscriptions_plan_id_fkey(
        id,
        name,
        credits_per_month
      )
    `,
    )
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
    .eq('cancel_at_period_end', false);

  return { data, error };
}
