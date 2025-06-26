import { IPricingPlan } from "../types";

type PricingPlanHeaderProps = {
  plan: IPricingPlan;
  compact?: boolean;
};

export const PricingPlanHeader = ({
  plan,
  compact = false,
}: PricingPlanHeaderProps) => (
  <div className="flex flex-col items-center">
    <span
      className={`${compact ? "text-lg" : "text-xl"} font-bold ${plan.color}`}
    >
      {plan.name}
    </span>
    <span
      className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground mt-1`}
    >
      {plan.price}/month
    </span>
  </div>
);
