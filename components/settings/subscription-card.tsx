import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { SubscriptionDates } from "./subscription-dates";
import { ManageBillingButton } from "./manage-billing-button";
type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  subscription_plans: {
    id: string;
    name: string;
    price_cents: number;
    credits_per_month: number;
    stripe_price_id: string;
    stripe_product_id: string;
  };
};

type SubscriptionCardProps = {
  subscription: Subscription;
  onExecuteBilling: () => void;
  isBillingPending: boolean;
};

export function SubscriptionCard({
  subscription,
  onExecuteBilling,
  isBillingPending,
}: SubscriptionCardProps) {
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

        <ManageBillingButton
          onExecute={onExecuteBilling}
          isPending={isBillingPending}
        />
      </CardContent>
    </Card>
  );
}
