"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import {
  createCheckoutSessionAction,
  purchaseCreditPackageAction,
} from "@/features/payments/actions";
import { routes } from "@/routes";
import { toast } from "@/hooks/use-toast";
import { PLAN_ID_MAPPING, CREDIT_PACKAGES } from "../constants";
import { userSubscriptionWithRetryOptions } from "../queries-client";
import {
  calculateDaysRemaining,
  isSubscriptionCancelled,
  isSubscriptionPeriodValid,
} from "../utils/subscription-utils";

export const usePricing = () => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [processingCreditPackage, setProcessingCreditPackage] =
    useState<boolean>(false);

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery(userSubscriptionWithRetryOptions);

  const currentSubscription = subscriptionData?.subscription;
  const hasActiveSubscription =
    subscriptionData?.hasActiveSubscription ?? false;

  const { execute: createCheckoutSession } = useAction(
    createCheckoutSessionAction,
    {
      onSuccess: () => {
        setProcessingPlan(null);
      },
      onError: ({ error }) => {
        setProcessingPlan(null);
        toast.error({
          title: "Failed to create checkout session",
          description: error.serverError || "Please try again later",
        });
      },
    },
  );

  const { execute: purchaseCreditPackage } = useAction(
    purchaseCreditPackageAction,
    {
      onSuccess: () => {
        setProcessingCreditPackage(false);
      },
      onError: ({ error }) => {
        setProcessingCreditPackage(false);
        toast.error({
          title: "Failed to create credit package checkout",
          description: error.serverError || "Please try again later",
        });
      },
    },
  );

  const canSubscribeToPlan = useMemo(() => {
    return (planId: string) => {
      if (!currentSubscription) return true;

      const actualPlanId =
        PLAN_ID_MAPPING[planId as keyof typeof PLAN_ID_MAPPING] || planId;

      if (currentSubscription.plan_id === actualPlanId) {
        if (isSubscriptionCancelled(currentSubscription)) {
          return false;
        }
        return false;
      }

      if (
        hasActiveSubscription &&
        !isSubscriptionCancelled(currentSubscription)
      ) {
        return true;
      }

      return true;
    };
  }, [currentSubscription, hasActiveSubscription]);

  const getSubscriptionStatus = useMemo(() => {
    return (planId: string) => {
      if (subscriptionLoading) return "loading";
      if (subscriptionError) return "error";
      if (!currentSubscription) return "can-subscribe";

      const actualPlanId =
        PLAN_ID_MAPPING[planId as keyof typeof PLAN_ID_MAPPING] || planId;

      if (currentSubscription.plan_id === actualPlanId) {
        if (isSubscriptionCancelled(currentSubscription)) {
          return isSubscriptionPeriodValid(currentSubscription)
            ? "active-cancelled"
            : "expired";
        }

        if (isSubscriptionPeriodValid(currentSubscription)) {
          return "active";
        }

        return "expired";
      }

      if (
        hasActiveSubscription &&
        !isSubscriptionCancelled(currentSubscription)
      ) {
        return "has-other-plan";
      }

      return "can-subscribe";
    };
  }, [
    currentSubscription,
    hasActiveSubscription,
    subscriptionLoading,
    subscriptionError,
  ]);

  const getDaysUntilResubscribe = useMemo(() => {
    return (planId: string): number => {
      if (!currentSubscription) return 0;

      const actualPlanId =
        PLAN_ID_MAPPING[planId as keyof typeof PLAN_ID_MAPPING] || planId;

      if (
        currentSubscription.plan_id === actualPlanId &&
        isSubscriptionCancelled(currentSubscription)
      ) {
        return calculateDaysRemaining(currentSubscription.current_period_end);
      }

      return 0;
    };
  }, [currentSubscription]);

  const handleSubscribe = async (productId: string | null, planId: string) => {
    if (!productId) {
      window.location.href = routes.register;
      return;
    }

    const status = getSubscriptionStatus(planId);

    if (status === "active" || status === "active-cancelled") {
      console.warn(
        `Cannot subscribe to plan ${planId}: user already has this plan`,
      );
      return;
    }

    setProcessingPlan(planId);
    createCheckoutSession({ productId });
  };

  const handlePurchaseCredits = async () => {
    setProcessingCreditPackage(true);
    const creditPackage = CREDIT_PACKAGES.CREDITS_100;

    purchaseCreditPackage({
      packageId: creditPackage.id,
      credits: creditPackage.credits,
      productId: creditPackage.stripe_price_id,
    });
  };

  const getButtonText = (planId: string, defaultText: string) => {
    const status = getSubscriptionStatus(planId);

    switch (status) {
      case "loading":
        return "Loading...";
      case "active":
        return "Current Plan";
      case "active-cancelled": {
        const daysRemaining = getDaysUntilResubscribe(planId);
        return `You can subscribe to this plan again after ${daysRemaining} days`;
      }
      case "has-other-plan":
        return "Switch Plan";
      case "expired":
        return "Renew";
      case "can-subscribe":
      default:
        return defaultText;
    }
  };

  const isButtonDisabled = (planId: string) => {
    const status = getSubscriptionStatus(planId);
    return (
      status === "loading" ||
      status === "active" ||
      status === "active-cancelled" ||
      processingPlan === planId
    );
  };

  return {
    processingPlan,
    processingCreditPackage,
    handleSubscribe,
    handlePurchaseCredits,
    currentSubscription,
    hasActiveSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    canSubscribeToPlan,
    getSubscriptionStatus,
    getButtonText,
    isButtonDisabled,
    getDaysUntilResubscribe,
  };
};
