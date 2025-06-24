import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PricingPlanHeader } from './pricing-plan-header';
import { PricingFeatureValue } from './pricing-feature-value';
import { PricingPlanButton } from './pricing-plan-button';
import { PRICING_DATA } from '../constants';
import { IPricingPlan } from '../types';

type PricingTableProps = {
  compact?: boolean;
  plans: IPricingPlan[];
  onSubscribe: (productId: string, planId: string) => void;
  getButtonText: (planId: string, defaultText: string) => string;
  isButtonDisabled: (planId: string) => boolean;
  getSubscriptionStatus: (planId: string) => string;
  getDaysUntilResubscribe: (planId: string) => number;
  processingPlan: string | null;
};

export const PricingTable = ({
  compact = false,
  plans,
  onSubscribe,
  getButtonText,
  isButtonDisabled,
  getSubscriptionStatus,
  getDaysUntilResubscribe,
  processingPlan,
}: PricingTableProps) => (
  <Card className="border-border bg-card shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className={`${compact ? 'w-[140px] py-4' : 'w-[200px] py-6'} font-semibold`}>
            Features
          </TableHead>
          {plans.map((plan) => (
            <TableHead
              key={plan.id}
              className={`text-center relative ${compact ? 'py-4' : 'py-6'}`}
            >
              <PricingPlanHeader plan={plan} compact={compact} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PRICING_DATA.features.map((feature) => (
          <TableRow key={feature.name} className="border-border">
            <TableCell className={`font-medium ${compact ? 'py-3 text-sm' : 'py-4'}`}>
              {feature.name}
            </TableCell>
            {feature.values.map((value, planIndex) => (
              <TableCell
                key={planIndex}
                className={`text-center ${compact ? 'py-3 text-sm' : 'py-4'} ${
                  planIndex === 1 ? 'bg-accent/30' : ''
                }`}
              >
                <PricingFeatureValue value={value} compact={compact} />
              </TableCell>
            ))}
          </TableRow>
        ))}
        <TableRow className="border-border">
          <TableCell className={compact ? 'py-4' : 'py-6'} />
          {plans.map((plan, index) => (
            <TableCell
              key={plan.id}
              className={`text-center ${compact ? 'py-4 px-2' : 'py-6 px-4'} ${
                index === 1 ? 'bg-accent/30' : ''
              }`}
            >
              <PricingPlanButton
                plan={plan}
                index={index}
                compact={compact}
                onSubscribe={onSubscribe}
                getButtonText={getButtonText}
                isButtonDisabled={isButtonDisabled}
                getSubscriptionStatus={getSubscriptionStatus}
                getDaysUntilResubscribe={getDaysUntilResubscribe}
                processingPlan={processingPlan}
              />
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  </Card>
);
