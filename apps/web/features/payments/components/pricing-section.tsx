"use client";

import { PricingHeader } from "./pricing-header";
import { PricingTable } from "./pricing-table";
import { AdditionalCreditsCard } from "./additional-credits-card";
import { usePricing } from "../hooks/use-pricing";
import { PRICING_DATA } from "../constants";

type IPricingSectionProps = {
  compact?: boolean;
};

export const PricingSection = ({ compact = false }: IPricingSectionProps) => {
  const {
    handleSubscribe,
    handlePurchaseCredits,
    getButtonText,
    isButtonDisabled,
    processingPlan,
    processingCreditPackage,
    getSubscriptionStatus,
    getDaysUntilResubscribe,
    isLoading: subscriptionLoading,
  } = usePricing();

  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-muted-foreground">
        Loading subscription data...
      </span>
    </div>
  );

  return (
    <section className={`${compact ? "py-0" : "py-24"}`}>
      <div className={`${compact ? "px-6" : "container mx-auto px-4"}`}>
        <PricingHeader compact={compact} />

        {subscriptionLoading && renderLoadingState()}

        <div className={`${compact ? "max-w-full" : "mx-auto max-w-5xl"}`}>
          <PricingTable
            compact={compact}
            plans={PRICING_DATA.plans}
            onSubscribe={handleSubscribe}
            getButtonText={getButtonText}
            isButtonDisabled={isButtonDisabled}
            getSubscriptionStatus={getSubscriptionStatus}
            getDaysUntilResubscribe={getDaysUntilResubscribe}
            processingPlan={processingPlan}
          />

          <AdditionalCreditsCard
            compact={compact}
            onPurchaseCredits={handlePurchaseCredits}
            processingCreditPackage={processingCreditPackage}
          />
        </div>
      </div>
    </section>
  );
};
