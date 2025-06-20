import { createClient } from '@/lib/supabase/server';
import { Tables, Database } from '@/database.types';
import { ICreditTransactionType } from '@/types';
import {
  CREDIT_BUCKET_STATUS,
  TRANSACTION_TYPES,
  USER_SUBSCRIPTION_STATUS,
} from '@/config/constants';

type CreditSourceType = Database['public']['Enums']['credit_source_type_enum'];
type CreditBucketStatus = Database['public']['Enums']['credit_bucket_status_enum'];

export type CreateCreditBucketInput = {
  userId: string;
  creditsTotal: number;
  sourceType: CreditSourceType;
  description: string | null;
  expiresAt: string | null;
  metadata?: Record<string, any> | null;
  user_subscription_id?: string | null;
};

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

export async function createCreditBucket(input: CreateCreditBucketInput) {
  const supabase = await createClient();
  const {
    userId,
    creditsTotal,
    sourceType,
    description,
    expiresAt,
    metadata,
    user_subscription_id,
  } = input;
  const { data, error } = await supabase
    .from('credit_buckets')
    .insert({
      user_id: userId,
      credits_total: creditsTotal,
      credits_used: 0,
      source_type: sourceType,
      status: CREDIT_BUCKET_STATUS.ACTIVE,
      description,
      expires_at: expiresAt,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      user_subscription_id,
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
  description: string | null,
  expiresAt: string | null,
) {
  return createCreditBucket({
    userId,
    creditsTotal: creditsAmount,
    sourceType,
    description,
    expiresAt,
  });
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
      profiles!credit_buckets_user_id_fkey(id, email),
      user_subscriptions!fk_user_subscription(
        id,
        plan_id,
        status,
        subscription_plans!user_subscriptions_plan_id_fkey(
          id,
          name,
          credits_per_month
        )
      )
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
    .eq('status', USER_SUBSCRIPTION_STATUS.ACTIVE)
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
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('credits_remaining, expires_at')
    .eq('user_id', userId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (error) return { totalCredits: 0, error };

  const totalCredits = data?.reduce((sum, bucket) => sum + (bucket.credits_remaining || 0), 0) || 0;

  return { totalCredits, error: null };
}

export async function getExpiredCreditBuckets() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('*')
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE)
    .not('expires_at', 'is', null)
    .lt('expires_at', now);

  return { data, error };
}

export async function expireCreditBuckets(bucketIds: string[]) {
  const supabase = await createClient();

  if (bucketIds.length === 0) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('credit_buckets')
    .update({
      status: CREDIT_BUCKET_STATUS.EXPIRED,
      updated_at: new Date().toISOString(),
    })
    .in('id', bucketIds)
    .select();

  return { data, error };
}

export async function getUserValidCredits(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function bulkExpireCreditBuckets() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // First, get all expired buckets
  const { data: expiredBuckets, error: fetchError } = await supabase
    .from('credit_buckets')
    .select('id, user_id, credits_remaining, description')
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE)
    .not('expires_at', 'is', null)
    .lt('expires_at', now);

  if (fetchError || !expiredBuckets) {
    return { expiredCount: 0, error: fetchError };
  }

  if (expiredBuckets.length === 0) {
    return { expiredCount: 0, error: null };
  }

  // Update all expired buckets
  const { error: updateError } = await supabase
    .from('credit_buckets')
    .update({
      status: CREDIT_BUCKET_STATUS.EXPIRED,
      updated_at: now,
    })
    .in(
      'id',
      expiredBuckets.map((b) => b.id),
    );

  if (updateError) {
    return { expiredCount: 0, error: updateError };
  }

  // Create transaction records for expired credits
  const transactions = expiredBuckets
    .filter((bucket) => bucket.credits_remaining && bucket.credits_remaining > 0)
    .map((bucket) => ({
      user_id: bucket.user_id,
      amount: -(bucket.credits_remaining || 0),
      type: TRANSACTION_TYPES.MONTHLY_RESET as ICreditTransactionType,
      description: `Credits expired - ${bucket.description || 'Credit bucket'}`,
    }));

  if (transactions.length > 0) {
    const { error: transactionError } = await bulkCreateCreditTransactions(transactions);
    if (transactionError) {
      console.error('Failed to create expiration transactions:', transactionError);
    }
  }

  return { expiredCount: expiredBuckets.length, error: null };
}

// Legacy function names for backward compatibility
export const getUserCredits = getUserCreditBuckets;
export const createUserCredits = (userId: string, initialCredits = 0, description: string | null = null) =>
  createCreditBucket({
    userId,
    creditsTotal: initialCredits,
    sourceType: 'bonus',
    description,
    expiresAt: null,
  });
export const updateUserCredits = updateCreditBucket;
export const upsertUserCredits = addCreditsToUser;
export const resetUserCredits = resetCreditBuckets;
