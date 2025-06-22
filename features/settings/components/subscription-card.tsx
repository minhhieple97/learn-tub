import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { SubscriptionDates } from './subscription-dates';
import { ManageBillingButton } from './manage-billing-button';
import type { ISubscriptionCardProps } from '../types';

export const SubscriptionCard = ({
  subscription,
  onExecuteBilling,
  isBillingPending,
}: ISubscriptionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <SubscriptionDates
          currentPeriodStart={subscription.current_period_start}
          currentPeriodEnd={subscription.current_period_end}
          cancelAtPeriodEnd={subscription.cancel_at_period_end}
        />

        <ManageBillingButton onExecute={onExecuteBilling} isPending={isBillingPending} />
      </CardContent>
    </Card>
  );
};
