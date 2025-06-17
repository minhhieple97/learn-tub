import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/database.types';

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

// User Credits Queries
export async function getUserCredits(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function createUserCredits(userId: string, initialCredits = 0) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      credits_available: initialCredits,
      credits_used_this_month: 0,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateUserCredits(
  userId: string,
  updates: Partial<
    Pick<
      Tables<'user_credits'>,
      'credits_available' | 'credits_used_this_month' | 'last_reset_date'
    >
  >,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_credits')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function upsertUserCredits(userId: string, credits: number) {
  const supabase = await createClient();

  // First try to get existing record
  const { data: existingCredits } = await getUserCredits(userId);

  if (existingCredits) {
    return updateUserCredits(userId, {
      credits_available: existingCredits.credits_available + credits,
    });
  } else {
    return createUserCredits(userId, credits);
  }
}
