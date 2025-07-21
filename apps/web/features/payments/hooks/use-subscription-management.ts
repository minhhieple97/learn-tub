"use client";

import { userSubscriptionWithRetryOptions } from "@/features/payments/queries-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  calculateDaysRemaining,
  isSubscriptionCancelled,
} from "@/features/payments/utils/subscription-utils";

export function useSubscriptionManagement() {
  const { data: subscriptionData, isLoading } = useQuery(
    userSubscriptionWithRetryOptions,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const subscription = subscriptionData?.subscription;
  const hasActiveSubscription =
    subscriptionData?.hasActiveSubscription && subscription;

  // Check if subscription is cancelled but still active
  const isSubscriptionCancelledButActive = subscription
    ? isSubscriptionCancelled(subscription)
    : false;

  // Calculate days remaining for cancelled subscription
  const daysUntilExpiry = subscription
    ? calculateDaysRemaining(subscription.current_period_end)
    : 0;

  return {
    subscription,
    isLoading,
    hasActiveSubscription,
    isDialogOpen,
    setIsDialogOpen,
    isSubscriptionCancelledButActive,
    daysUntilExpiry,
  };
}
