import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/database.types';
import { ICreditTransactionType } from '@/types';

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
      | 'credits_purchase'
      | 'credits_subscription'
      | 'credits_used_this_month'
      | 'last_reset_purchase_date'
      | 'last_reset_subscription_date'
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
  // First try to get existing record
  const { data: existingCredits } = await getUserCredits(userId);

  if (existingCredits) {
    return updateUserCredits(userId, {
      credits_purchase: (existingCredits?.credits_purchase ?? 0) + credits,
      credits_subscription: existingCredits.credits_subscription + credits,
    });
  } else {
    return createUserCredits(userId, credits);
  }
}

export async function addCreditsToUser(userId: string, creditsAmount: number) {
  const supabase = await createClient();
  const { data: userCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (userCredits) {
    // Update existing credits
    const { error } = await supabase
      .from('user_credits')
      .update({
        credits_purchase: (userCredits?.credits_purchase ?? 0) + creditsAmount,
      })
      .eq('user_id', userId);

    return { error };
  } else {
    // Create new credits record
    const { error } = await supabase.from('user_credits').insert({
      user_id: userId,
      credits_available: creditsAmount,
      credits_used_this_month: 0,
    });

    return { error };
  }
}

export async function createCreditTransaction(
  userId: string,
  amount: number,
  type:
    | 'monthly_reset'
    | 'purchase'
    | 'evaluate_note'
    | 'generate_quizz_questions'
    | 'evaluate_quizz_answers'
    | 'refund'
    | 'bonus'
    | 'subscription_grant'
    | 'admin_adjustment',
  description: string,
  stripePaymentIntentId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    stripe_payment_intent_id: stripePaymentIntentId,
  });

  return { data, error };
}
