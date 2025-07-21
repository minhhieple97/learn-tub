"use client";

import { useSubscriptionManagement } from "@/features/payments/hooks";
import { useBillingManagement } from "@/features/payments/hooks";
import { SubscriptionCard } from "./subscription-card";
import { NoSubscriptionCard } from "./no-subscription-card";
import { SubscriptionSkeleton } from "./subscription-skeleton";

export const SubscriptionManagement = () => {
  const {
    subscription,
    isLoading,
    hasActiveSubscription,
    isDialogOpen,
    setIsDialogOpen,
  } = useSubscriptionManagement();

  const { execute, isPending } = useBillingManagement();

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (!hasActiveSubscription || !subscription) {
    return (
      <NoSubscriptionCard
        onDialogOpenChange={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
      />
    );
  }

  return (
    <SubscriptionCard
      subscription={subscription}
      onExecuteBilling={execute}
      isBillingPending={isPending}
    />
  );
};
