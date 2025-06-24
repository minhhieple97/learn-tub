import { z } from 'zod';

export const CreateCheckoutSessionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const PurchaseCreditsSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
});

export const PurchaseCreditPackageSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  credits: z.number().min(1, 'Credits must be at least 1'),
  productId: z.string().min(1, 'Product ID is required'),
});

export const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

export const UpdateSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
});

