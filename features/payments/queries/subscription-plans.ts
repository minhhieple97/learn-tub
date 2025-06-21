import { createClient } from '@/lib/supabase/server';

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
