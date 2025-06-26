"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Info } from "lucide-react";
import { PricingSection } from "./pricing-section";
import { useSubscriptionManagement } from "@/hooks/use-subscription-management";

export function PricingDialog() {
  const { isSubscriptionCancelledButActive, daysUntilExpiry, subscription } =
    useSubscriptionManagement();

  const renderCancelledSubscriptionNotice = () => {
    if (!isSubscriptionCancelledButActive || !subscription) return null;

    return (
      <div className="px-6 pb-4">
        <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Your current subscription has been cancelled and will expire in{" "}
            <span className="font-semibold">{daysUntilExpiry} days</span>. You
            can resubscribe to any plan after it expires.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-lg pt-4">
      <DialogHeader className="px-6 pt-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
          Plans & Pricing
        </DialogTitle>
      </DialogHeader>

      {renderCancelledSubscriptionNotice()}

      <div className="pt-4 pb-6">
        <PricingSection compact />
      </div>
    </div>
  );
}
