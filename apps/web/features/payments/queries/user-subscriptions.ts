import { createClient } from "@/lib/supabase/server";
import {
  IUserSubscriptionStatus,
  ISubscriptionData,
  ICachedSubscriptionData,
} from "../types";
import { CacheClient } from "@/lib/cache-client";
import { TIME_CONSTANTS } from "../constants";

export const getUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return { data, error };
};

export const getUserStripeCustomerId = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  return { data, error };
};

export const getUserByStripeCustomerId = async (customerId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("id, user_id, plan_id")
    .eq("stripe_customer_id", customerId)
    .single();

  return { data, error };
};

export const upsertUserSubscription = async (
  userId: string,
  planId: string,
  subscriptionData: ISubscriptionData,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .upsert({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId,
      stripe_customer_id: subscriptionData.stripeCustomerId,
      status: subscriptionData.status || "active",
      current_period_start:
        subscriptionData.currentPeriodStart?.toISOString() || null,
      current_period_end:
        subscriptionData.currentPeriodEnd?.toISOString() || null,
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
};

export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: IUserSubscriptionStatus,
  periodStart?: number,
  periodEnd?: number,
  cancelAtPeriodEnd?: boolean,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      status: status as "active" | "exhausted" | "expired" | "cancelled",
      current_period_start: periodStart
        ? new Date(periodStart * 1000).toISOString()
        : undefined,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : undefined,
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    .eq("stripe_subscription_id", subscriptionId)
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
};

export const getUserActiveSubscription = async (
  userId: string,
): Promise<ICachedSubscriptionData | null> => {
  const cachedSubscription = await CacheClient.getUserSubscription(userId);
  if (cachedSubscription) {
    return cachedSubscription;
  }

  // If not cached, fetch from database
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_subscriptions")
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
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("current_period_end", now)
    .maybeSingle();

  if (!error && data) {
    const hasActiveSubscription = Boolean(data);
    const isCancelled = Boolean(data.cancel_at_period_end);

    let daysRemaining = 0;
    if (data.current_period_end) {
      const endDate = new Date(data.current_period_end);
      const diffTime = endDate.getTime() - new Date().getTime();
      daysRemaining = Math.max(
        0,
        Math.ceil(diffTime / TIME_CONSTANTS.MILLISECONDS_IN_DAY),
      );
    }

    const cachedData = {
      subscription: data,
      hasActiveSubscription,
      isCancelled,
      daysRemaining,
    };

    await CacheClient.setUserSubscription(userId, cachedData);
    return cachedData;
  }

  return null;
};

export const getUserSubscriptionWithStatus = async (userId: string) => {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_subscriptions")
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
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("current_period_end", now)
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
    daysRemaining = Math.max(
      0,
      Math.ceil(diffTime / TIME_CONSTANTS.MILLISECONDS_IN_DAY),
    );
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
};

export const checkUserHasActivePlan = async (
  userId: string,
  planId: string,
) => {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("status", "active")
    .lte("current_period_start", now)
    .gte("current_period_end", now)
    .single();

  return {
    hasActivePlan: !!data && !error,
    error: error?.code === "PGRST116" ? null : error,
  };
};

export const checkUserHasAnyActiveSubscription = async (userId: string) => {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("id, plan_id, current_period_start, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .lte("current_period_start", now)
    .gte("current_period_end", now)
    .single();

  return {
    hasActiveSubscription: !!data && !error,
    subscription: data,
    error: error?.code === "PGRST116" ? null : error,
  };
};

export const getActiveSubscriptionByStripeIds = async (
  stripeCustomerId: string,
  stripeSubscriptionId: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
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
    .eq("stripe_customer_id", stripeCustomerId)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .eq("status", "active")
    .eq("cancel_at_period_end", false)
    .single();

  return { data, error };
};

export const expireUserSubscription = async (subscriptionId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "expired" as const,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  return { data, error };
};

export const createNewUserSubscription = async (
  userId: string,
  planId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: "active" as const,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    })
    .select()
    .single();

  return { data, error };
};

export const updateSubscriptionCancellation = async (
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .eq("status", "active")
    .select()
    .single();

  if (!error && data) {
    await Promise.all([
      CacheClient.invalidateUserSubscription(data.user_id),
      CacheClient.invalidateUserProfile(data.user_id),
    ]);
  }

  return { data, error };
};

export const getUsersWithActiveSubscriptions = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
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
    .eq("status", "active")
    .eq("cancel_at_period_end", false);

  return { data, error };
};

export const cancelActiveFreePlan = async (
  userId: string,
  freePlanId: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "cancelled" as const,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("plan_id", freePlanId)
    .eq("status", "active")
    .select();

  const creditBucketsUpdateStatusPromises = data
    ? data.map((subscription) => {
        supabase
          .from("credit_buckets")
          .update({
            status: "cancelled" as const,
          })
          .eq("user_subscription_id", subscription.id);
      })
    : [];

  if (!error && data && data.length > 0) {
    await Promise.all([
      ...creditBucketsUpdateStatusPromises,
      CacheClient.invalidateUserSubscription(userId),
      CacheClient.invalidateUserProfile(userId),
    ]);
  }

  return { data, error };
};
