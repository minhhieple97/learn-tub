import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Gift } from "lucide-react";
import { SubscriptionDates } from "./subscription-dates";
import { ManageBillingButton } from "./manage-billing-button";
import { PLAN_ID_MAPPING } from "@/features/payments/constants";
import type { ISubscriptionCardProps } from "../types";

export const SubscriptionCard = ({
  subscription,
  onExecuteBilling,
  isBillingPending,
}: ISubscriptionCardProps) => {
  const isFreePlan =
    subscription.subscription_plans.id === PLAN_ID_MAPPING.FREE;

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

        {isFreePlan ? (
          <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  You're on the Free Plan
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Enjoy {subscription.subscription_plans.credits_per_month} AI
                  credits per month at no cost. Ready to unlock more features?
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ManageBillingButton
            onExecute={onExecuteBilling}
            isPending={isBillingPending}
          />
        )}
      </CardContent>
    </Card>
  );
};
