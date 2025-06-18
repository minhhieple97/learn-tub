'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { createCheckoutSessionAction } from '@/features/payments/actions';
import { routes } from '@/routes';
import { IPricingData } from '../types';
import { toast } from '@/hooks/use-toast';

export const usePricing = () => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const { execute: createCheckoutSession } = useAction(createCheckoutSessionAction, {
    onSuccess: () => {
      setProcessingPlan(null);
    },
    onError: ({ error }) => {
      setProcessingPlan(null);
      toast.error({
        title: 'Failed to create checkout session',
        description: error.serverError || 'Please try again later',
      });
    },
  });

  const handleSubscribe = async (productId: string | null, planId: string) => {
    if (!productId) {
      window.location.href = routes.register;
      return;
    }
    setProcessingPlan(planId);
    createCheckoutSession({ productId });
  };

  return {
    processingPlan,
    handleSubscribe,
  };
};

export const pricingData: IPricingData = {
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
      productId: null,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$2',
      color: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-purple-600',
      productId: 'prod_SVCVKAQ94lH5CT',
    },
  ],
  features: [
    {
      name: 'AI Credits',
      values: ['50 credits/month', '500 credits/month'],
    },
    {
      name: 'Note Taking',
      values: ['Unlimited', 'Unlimited'],
    },
    {
      name: 'AI Analysis',
      values: ['Basic', 'Advanced'],
    },
    {
      name: 'Support',
      values: ['Email', 'Priority'],
    },
    {
      name: 'Export',
      values: [false, true],
    },
  ],
};
