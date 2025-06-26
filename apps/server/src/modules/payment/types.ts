export type CreatePaymentHistoryData = {
  user_id: string;
  amount_cents: number;
  currency: string;
  payment_type: string;
  status: 'completed' | 'failed';
  description: string;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
};

export type CreatePaymentHistoryDto = {
  userId: string;
  amountCents: number;
  currency: string;
  paymentType: string;
  status: 'completed' | 'failed';
  description: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
};
