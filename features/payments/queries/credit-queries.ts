import { createClient } from '@/lib/supabase/server';
import { Tables, Database } from '@/database.types';
import { ICreditTransactionType } from '@/types';
import { CREDIT_BUCKET_STATUS } from '@/config/constants';

type CreditSourceType = Database['public']['Enums']['credit_source_type_enum'];
type CreditBucketStatus = Database['public']['Enums']['credit_bucket_status_enum'];

export async function getUserCreditBuckets(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function getUserCreditBucketsByType(userId: string, sourceType: CreditSourceType) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('*')
    .eq('user_id', userId)
    .eq('source_type', sourceType)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function createCreditBucket(
  userId: string,
  creditsTotal: number,
  sourceType: CreditSourceType,
  description?: string,
  expiresAt?: string,
  metadata?: Record<string, any>,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .insert({
      user_id: userId,
      credits_total: creditsTotal,
      credits_used: 0,
      credits_remaining: creditsTotal,
      source_type: sourceType,
      status: 'active' as CreditBucketStatus,
      description,
      expires_at: expiresAt,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateCreditBucket(
  bucketId: string,
  updates: Partial<
    Pick<Tables<'credit_buckets'>, 'credits_used' | 'credits_remaining' | 'status' | 'updated_at'>
  >,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bucketId)
    .select()
    .single();

  return { data, error };
}

export async function addCreditsToUser(
  userId: string,
  creditsAmount: number,
  sourceType: CreditSourceType = 'purchase',
  description?: string,
  expiresAt?: string,
) {
  return createCreditBucket(userId, creditsAmount, sourceType, description, expiresAt);
}

export async function createCreditTransaction(
  userId: string,
  amount: number,
  type: ICreditTransactionType,
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

export async function getAllUsersForCreditReset() {
  const supabase = await createClient();

  // Get all users who have credit buckets that need resetting
  const { data, error } = await supabase
    .from('credit_buckets')
    .select(
      `
      *,
      profiles!credit_buckets_user_id_fkey(id, email)
    `,
    )
    .eq('status', 'active')
    .in('source_type', ['subscription', 'purchase']);

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
    .eq('status', 'active')
    .eq('cancel_at_period_end', false);

  return { data, error };
}

export async function resetCreditBuckets(userId: string, sourceType: CreditSourceType) {
  const supabase = await createClient();

  // Mark existing buckets of this type as expired
  const { error } = await supabase
    .from('credit_buckets')
    .update({
      status: 'expired' as CreditBucketStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('source_type', sourceType)
    .eq('status', 'active');

  return { error };
}

export async function bulkCreateCreditTransactions(
  transactions: Array<{
    user_id: string;
    amount: number;
    type: ICreditTransactionType;
    description: string;
  }>,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('credit_transactions').insert(transactions);

  return { data, error };
}

export async function getUserTotalCredits(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('credits_remaining')
    .eq('user_id', userId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  if (error) return { totalCredits: 0, error };

  const totalCredits = data?.reduce((sum, bucket) => sum + (bucket.credits_remaining || 0), 0) || 0;

  return { totalCredits, error: null };
}

// Legacy function names for backward compatibility
export const getUserCredits = getUserCreditBuckets;
export const createUserCredits = (userId: string, initialCredits = 0) =>
  createCreditBucket(userId, initialCredits, 'bonus', 'Initial credits');
export const updateUserCredits = updateCreditBucket;
export const upsertUserCredits = addCreditsToUser;
export const resetUserCredits = resetCreditBuckets;
