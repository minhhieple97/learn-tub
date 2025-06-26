import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { IPricingPlan } from "../types";

type PricingPlanButtonProps = {
  plan: IPricingPlan;
  index: number;
  compact?: boolean;
  onSubscribe: (productId: string, planId: string) => void;
  getButtonText: (planId: string, defaultText: string) => string;
  isButtonDisabled: (planId: string) => boolean;
  getSubscriptionStatus: (planId: string) => string;
  getDaysUntilResubscribe: (planId: string) => number;
  processingPlan: string | null;
};

export const PricingPlanButton = ({
  plan,
  index,
  compact = false,
  onSubscribe,
  getButtonText,
  isButtonDisabled,
  getSubscriptionStatus,
  getDaysUntilResubscribe,
  processingPlan,
}: PricingPlanButtonProps) => {
  // Free plan doesn't have a button
  if (index === 0) return null;

  const defaultButtonText = index === 1 ? "Go Pro" : "Go Premium";
  const buttonText = getButtonText(plan.id, defaultButtonText);
  const disabled = isButtonDisabled(plan.id);
  const isProcessing = processingPlan === plan.id;
  const status = getSubscriptionStatus(plan.id);
  const daysRemaining = getDaysUntilResubscribe(plan.id);

  const getButtonVariant = () => {
    switch (status) {
      case "active":
        return "secondary";
      case "active-cancelled":
        return "outline";
      default:
        return "default";
    }
  };

  const getButtonClassName = () => {
    const baseClass = `w-full ${compact ? "text-xs" : "text-sm"} transition-all`;

    switch (status) {
      case "active":
        return `${baseClass} bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg`;
      case "active-cancelled":
        return `${baseClass} border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20`;
      default:
        return `${baseClass} bg-gradient-to-r ${plan.gradient} text-white shadow-md hover:shadow-lg`;
    }
  };

  const handleClick = () => {
    if (plan.productId && plan.id) {
      onSubscribe(plan.productId, plan.id);
    }
  };

  const renderButtonContent = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Processing...
        </div>
      );
    }

    if (status === "active-cancelled" && daysRemaining > 0) {
      return (
        <div className="flex items-center justify-center">
          <Clock className="mr-2 size-4" />
          <span className="text-center leading-tight">
            Available after {daysRemaining} days
          </span>
        </div>
      );
    }

    return buttonText;
  };

  return (
    <Button
      className={getButtonClassName()}
      variant={getButtonVariant()}
      size={compact ? "sm" : "default"}
      onClick={handleClick}
      disabled={disabled}
    >
      {renderButtonContent()}
    </Button>
  );
};
