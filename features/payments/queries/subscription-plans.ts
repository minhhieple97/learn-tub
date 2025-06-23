import { createClient } from '@/lib/supabase/server';

export type SubscriptionPlan = {
  id: string;
  name: string;
  stripe_product_id: string;
  stripe_price_id: string;
  price_cents: number;
  credits_per_month: number;
};

export async function getAllSubscriptionPlans() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, name, stripe_product_id, stripe_price_id, price_cents, credits_per_month')
    .eq('is_active', true)
    .order('price_cents', { ascending: true });

  return { data, error };
}

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
