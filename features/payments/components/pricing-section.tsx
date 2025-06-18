'use client';

import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePricing, pricingData } from '../hooks/use-pricing';
import { IPricingPlan } from '../types';

type IPricingSectionProps = {
  compact?: boolean;
};

export const PricingSection = ({ compact = false }: IPricingSectionProps) => {
  const { processingPlan, handleSubscribe } = usePricing();

  const renderHeader = () => {
    if (compact) return null;

    return (
      <div className="mb-16 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
          <Zap className="mr-2 size-4" />
          Simple, transparent pricing
        </div>
        <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
          Choose Your{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Learning Plan
          </span>
        </h2>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Start free and upgrade as you grow. All plans include unlimited note-taking.
        </p>
      </div>
    );
  };

  const renderPlanHeader = (plan: IPricingPlan) => (
    <div className="flex flex-col items-center">
      <span className={`${compact ? 'text-lg' : 'text-xl'} font-bold ${plan.color}`}>
        {plan.name}
      </span>
      <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
        {plan.price}/month
      </span>
    </div>
  );

  const renderFeatureValue = (value: string | boolean, isCompact: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center">
          <Check
            className={`${isCompact ? 'size-4' : 'size-5'} text-green-600 dark:text-green-400`}
          />
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }

    return <span className="text-foreground">{value}</span>;
  };

  const renderPlanButton = (plan: IPricingPlan, index: number) => {
    if (index === 0) return null;

    const isProcessing = processingPlan === plan.id;
    const buttonText = index === 1 ? 'Go Pro' : 'Go Premium';

    return (
      <Button
        className={`w-full ${compact ? 'text-xs' : 'text-sm'} bg-gradient-to-r ${plan.gradient} text-white shadow-md hover:shadow-lg transition-all`}
        variant="default"
        size={compact ? 'sm' : 'default'}
        onClick={() => handleSubscribe(plan.productId, plan.id)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Processing...
          </div>
        ) : (
          buttonText
        )}
      </Button>
    );
  };

  const renderAdditionalCredits = () => (
    <div className={`${compact ? 'mt-6' : 'mt-8'}`}>
      <Card className="border-border bg-card/70 shadow-sm">
        <CardContent
          className={`${compact ? 'p-4' : 'p-6'} flex items-center justify-between gap-4`}
        >
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
                <span className="font-semibold text-foreground">$1 for 100 credits</span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 shrink-0"
            size={compact ? 'sm' : 'default'}
            asChild
          >
            <Link href={routes.register} className="flex items-center whitespace-nowrap">
              Learn More
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <section className={`${compact ? 'py-0' : 'py-24'}`}>
      <div className={`${compact ? 'px-6' : 'container mx-auto px-4'}`}>
        {renderHeader()}

        <div className={`${compact ? 'max-w-full' : 'mx-auto max-w-5xl'}`}>
          <Card className="border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead
                    className={`${compact ? 'w-[140px] py-4' : 'w-[200px] py-6'} font-semibold`}
                  >
                    Features
                  </TableHead>
                  {pricingData.plans.map((plan) => (
                    <TableHead
                      key={plan.id}
                      className={`text-center relative ${compact ? 'py-4' : 'py-6'}`}
                    >
                      {renderPlanHeader(plan)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData.features.map((feature) => (
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
                        {renderFeatureValue(value, compact)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="border-border">
                  <TableCell className={compact ? 'py-4' : 'py-6'} />
                  {pricingData.plans.map((plan, index) => (
                    <TableCell
                      key={plan.id}
                      className={`text-center ${compact ? 'py-4 px-2' : 'py-6 px-4'} ${
                        index === 1 ? 'bg-accent/30' : ''
                      }`}
                    >
                      {renderPlanButton(plan, index)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          {renderAdditionalCredits()}
        </div>
      </div>
    </section>
  );
};
