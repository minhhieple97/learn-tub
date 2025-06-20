import { useState } from 'react';
import { useUserSubscription } from '@/features/payments/hooks/use-user-subscription';

export function useSubscriptionManagement() {
  const { data: subscription, isLoading } = useUserSubscription();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasActiveSubscription = subscription?.hasActiveSubscription && subscription.subscription;

  return {
    subscription: subscription?.subscription,
    isLoading,
    hasActiveSubscription,
    isDialogOpen,
    setIsDialogOpen,
  };
}
