import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowRight } from 'lucide-react';

type AdditionalCreditsCardProps = {
  compact?: boolean;
  onPurchaseCredits: () => void;
  processingCreditPackage: boolean;
};

export const AdditionalCreditsCard = ({
  compact = false,
  onPurchaseCredits,
  processingCreditPackage,
}: AdditionalCreditsCardProps) => (
  <div className={`${compact ? 'mt-6' : 'mt-8'}`}>
    <Card className="border-border bg-card/70 shadow-sm">
      <CardContent className={`${compact ? 'p-4' : 'p-6'} flex items-center justify-between gap-4`}>
        <div className="flex items-center space-x-4">
          <div
            className={`${compact ? 'hidden' : 'hidden sm:flex'} size-10 items-center justify-center rounded-full bg-blue-100/70 dark:bg-blue-900/50`}
          >
            <Zap className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3
              className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-foreground mb-1`}
            >
              Need More Credits?
            </h3>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Purchase additional credits anytime for just{' '}
              <span className="font-semibold text-foreground">$0.20 for 100 credits</span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 shrink-0"
          size={compact ? 'sm' : 'default'}
          onClick={onPurchaseCredits}
          disabled={processingCreditPackage}
        >
          <div className="flex items-center whitespace-nowrap">
            {processingCreditPackage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                Buy Credits
                <ArrowRight className="ml-1 size-4" />
              </>
            )}
          </div>
        </Button>
      </CardContent>
    </Card>
  </div>
);
