import { createClient } from "@/lib/supabase/server";

export async function createPaymentHistory(
  userId: string,
  amountCents: number,
  currency: string,
  paymentType: string,
  status: "completed" | "failed",
  description: string,
  stripePaymentIntentId?: string,
  stripeInvoiceId?: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("payment_history").insert({
    user_id: userId,
    amount_cents: amountCents,
    currency,
    payment_type: paymentType,
    status,
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_invoice_id: stripeInvoiceId,
    description,
  });

  return { data, error };
}
