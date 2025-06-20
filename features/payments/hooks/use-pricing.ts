'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { createCheckoutSessionAction } from '@/features/payments/actions';
import { routes } from '@/routes';
import { toast } from '@/hooks/use-toast';
import {
  PLAN_ID_MAPPING,
  USER_SUBSCRIPTION_QUERY_KEY,
  USER_SUBSCRIPTION_QUERY_URL,
} from '../constants';
import { IUserSubscriptionResponse } from '../types';




async function fetchUserSubscription(): Promise<IUserSubscriptionResponse> {
  const response = await fetch(USER_SUBSCRIPTION_QUERY_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch subscription');
  }

  return response.json();
}

export const usePricing = () => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery({
    queryKey: [USER_SUBSCRIPTION_QUERY_KEY],
    queryFn: fetchUserSubscription,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const currentSubscription = subscriptionData?.subscription;
  const hasActiveSubscription = subscriptionData?.hasActiveSubscription ?? false;

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

  const canSubscribeToPlan = useMemo(() => {
    return (planId: string) => {
      if (!currentSubscription) return true;

      const actualPlanId = PLAN_ID_MAPPING[planId] || planId;

      if (currentSubscription.plan_id === actualPlanId) return false;

      if (currentSubscription.current_period_end) {
        const now = new Date();
        const periodEnd = new Date(currentSubscription.current_period_end);

        if (now < periodEnd) return false;
      }

      return true;
    };
  }, [currentSubscription]);

  const getSubscriptionStatus = useMemo(() => {
    return (planId: string) => {
      if (subscriptionLoading) return 'loading';
      if (subscriptionError) return 'error';
      if (!currentSubscription) return 'can-subscribe';

      const actualPlanId = PLAN_ID_MAPPING[planId] || planId;

      if (currentSubscription.plan_id === actualPlanId) {
        if (currentSubscription.current_period_end) {
          const now = new Date();
          const periodEnd = new Date(currentSubscription.current_period_end);

          if (now < periodEnd) {
            return currentSubscription.cancel_at_period_end ? 'active-cancelling' : 'active';
          }
        }
        return 'expired';
      }

      if (hasActiveSubscription) return 'has-other-plan';

      return 'can-subscribe';
    };
  }, [currentSubscription, hasActiveSubscription, subscriptionLoading, subscriptionError]);

  const handleSubscribe = async (productId: string | null, planId: string) => {
    if (!productId) {
      window.location.href = routes.register;
      return;
    }

    if (!canSubscribeToPlan(planId)) {
      console.warn(`Cannot subscribe to plan ${planId}: user already has an active subscription`);
      return;
    }

    setProcessingPlan(planId);
    createCheckoutSession({ productId });
  };

  const getButtonText = (planId: string, defaultText: string) => {
    const status = getSubscriptionStatus(planId);

    switch (status) {
      case 'loading':
        return 'Loading...';
      case 'active':
        return 'Current Plan';
      case 'active-cancelling':
        return 'Cancelling';
      case 'has-other-plan':
        return 'Switch Plan';
      case 'expired':
        return 'Renew';
      case 'can-subscribe':
      default:
        return defaultText;
    }
  };

  const isButtonDisabled = (planId: string) => {
    const status = getSubscriptionStatus(planId);
    return (
      status === 'loading' ||
      status === 'active' ||
      status === 'active-cancelling' ||
      processingPlan === planId
    );
  };

  return {
    processingPlan,
    handleSubscribe,
    currentSubscription,
    hasActiveSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    canSubscribeToPlan,
    getSubscriptionStatus,
    getButtonText,
    isButtonDisabled,
  };
};

