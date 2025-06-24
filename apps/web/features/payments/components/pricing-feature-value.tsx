import { Check } from 'lucide-react';

type PricingFeatureValueProps = {
  value: string | boolean;
  compact?: boolean;
};

export const PricingFeatureValue = ({ value, compact = false }: PricingFeatureValueProps) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex justify-center">
        <Check className={`${compact ? 'size-4' : 'size-5'} text-green-600 dark:text-green-400`} />
      </div>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  }

  return <span className="text-foreground">{value}</span>;
};
