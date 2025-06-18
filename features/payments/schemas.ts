import { z } from 'zod';

export const CreateCheckoutSessionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const PurchaseCreditsSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
});

export const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

export const UpdateSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
});

