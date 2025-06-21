import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/database.types';
import { CREDIT_BUCKET_STATUS, CREDIT_SOURCE_TYPES, TRANSACTION_TYPES } from '@/config/constants';
import { ICreditSourceType } from '../types';
import { ICreditTransactionType } from '@/types';

export type ICreateCreditBucketInput = {
  userId: string;
  creditsTotal: number;
  sourceType: ICreditSourceType;
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

export async function getUserCreditBucketsByType(userId: string, sourceType: ICreditSourceType) {
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

export async function createCreditBucket(input: ICreateCreditBucketInput) {
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
  sourceType: ICreditSourceType = 'purchase',
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
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE)
    .in('source_type', [
      CREDIT_SOURCE_TYPES.SUBSCRIPTION,
      CREDIT_SOURCE_TYPES.PURCHASE,
      CREDIT_SOURCE_TYPES.CANCELLED_PLAN,
    ]);

  return { data, error };
}

export async function resetCreditBuckets(userId: string, sourceType: ICreditSourceType) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('credit_buckets')
    .update({
      status: CREDIT_BUCKET_STATUS.EXPIRED,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('source_type', sourceType)
    .eq('status', 'active');

  return { error };
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

export async function checkSufficientCredits(
  userId: string,
  requiredCredits: number = 1,
): Promise<{
  hasSufficientCredits: boolean;
  availableCredits: number;
  error: any;
}> {
  const { totalCredits, error } = await getUserTotalCredits(userId);

  if (error) {
    return {
      hasSufficientCredits: false,
      availableCredits: 0,
      error,
    };
  }

  return {
    hasSufficientCredits: totalCredits >= requiredCredits,
    availableCredits: totalCredits,
    error: null,
  };
}

export async function validateUserCreditsForOperation(
  userId: string,
  requiredCredits: number = 1,
): Promise<{
  success: boolean;
  message?: string;
  availableCredits: number;
}> {
  const { hasSufficientCredits, availableCredits, error } = await checkSufficientCredits(
    userId,
    requiredCredits,
  );

  if (error) {
    return {
      success: false,
      message: 'Failed to check credit balance',
      availableCredits: 0,
    };
  }

  if (!hasSufficientCredits) {
    return {
      success: false,
      message: `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`,
      availableCredits,
    };
  }

  return {
    success: true,
    availableCredits,
  };
}

export async function getCreditBucketsByUserSubscriptionId(userSubscriptionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_buckets')
    .select('*')
    .eq('user_subscription_id', userSubscriptionId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  return { data, error };
}

export async function expireCreditBucketsByUserSubscriptionId(userSubscriptionId: string) {
  const supabase = await createClient();

  // First get the buckets to know how many credits to deduct
  const { data: buckets, error: fetchError } = await supabase
    .from('credit_buckets')
    .select('id, user_id, credits_remaining, description')
    .eq('user_subscription_id', userSubscriptionId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  if (fetchError) {
    return { expiredBuckets: [], error: fetchError };
  }

  if (!buckets || buckets.length === 0) {
    return { expiredBuckets: [], error: null };
  }

  // Update all buckets to expired
  const { error: updateError } = await supabase
    .from('credit_buckets')
    .update({
      status: CREDIT_BUCKET_STATUS.EXPIRED,
      updated_at: new Date().toISOString(),
    })
    .eq('user_subscription_id', userSubscriptionId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  if (updateError) {
    return { expiredBuckets: [], error: updateError };
  }

  return { expiredBuckets: buckets, error: null };
}

export async function markCreditBucketsAsCancelled(userSubscriptionId: string) {
  const supabase = await createClient();

  // Get all active credit buckets for this subscription
  const { data: buckets, error: fetchError } = await supabase
    .from('credit_buckets')
    .select('id, user_id, credits_remaining, description')
    .eq('user_subscription_id', userSubscriptionId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  if (fetchError) {
    return { cancelledBuckets: [], error: fetchError };
  }

  if (!buckets || buckets.length === 0) {
    return { cancelledBuckets: [], error: null };
  }

  // Update source_type to cancelled_plan for all buckets
  const { error: updateError } = await supabase
    .from('credit_buckets')
    .update({
      source_type: CREDIT_SOURCE_TYPES.CANCELLED_PLAN,
      updated_at: new Date().toISOString(),
    })
    .eq('user_subscription_id', userSubscriptionId)
    .eq('status', CREDIT_BUCKET_STATUS.ACTIVE);

  if (updateError) {
    return { cancelledBuckets: [], error: updateError };
  }

  return { cancelledBuckets: buckets, error: null };
}

// Legacy function names for backward compatibility
export const getUserCredits = getUserCreditBuckets;
export const createUserCredits = (
  userId: string,
  initialCredits = 0,
  description: string | null = null,
) =>
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
