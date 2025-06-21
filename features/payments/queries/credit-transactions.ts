import { createClient } from '@/lib/supabase/server';
import { ICreditTransactionType } from '@/types';
import { CREDIT_BUCKET_STATUS, TRANSACTION_TYPES } from '@/config/constants';

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
