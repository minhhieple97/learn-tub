'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Check, Star, Crown } from 'lucide-react';
import { routes } from '@/routes';
import { useAction } from 'next-safe-action/hooks';
import { createCheckoutSessionAction } from '@/features/payments/actions';
import { useState } from 'react';

type PricingCardsProps = {
  inDialog?: boolean;
};

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceDuration: '/month',
    description: 'Perfect for getting started with AI-powered learning',
    features: [
      'Unlimited note-taking',
      '50 AI credits per month',
      'Basic AI note evaluation',
      'AI quiz generation',
    ],
    buttonText: 'Get Started Free',
    isPopular: false,
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-600',
    productId: null, // Free plan
    buttonVariant: 'default' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$2',
    priceDuration: '/month',
    description: 'For serious learners who want more AI-powered insights',
    features: [
      'Everything in Basic',
      '500 AI credits per month',
      'Advanced AI analysis',
      'Priority support',
      'Export capabilities',
    ],
    buttonText: 'Start Pro Trial',
    isPopular: true,
    icon: Star,
    gradient: 'from-indigo-500 to-purple-600',
    productId: 'prod_SVCVKAQ94lH5CT',
    buttonVariant: 'default' as const,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$5',
    priceDuration: '/month',
    description: 'For power users and professional learners',
    features: [
      'Everything in Pro',
      '1,500 AI credits per month',
      'Premium AI models',
      'Advanced analytics',
      'API access',
    ],
    buttonText: 'Go Premium',
    isPopular: true,
    icon: Crown,
    gradient: 'from-purple-500 to-pink-600',
    productId: 'prod_SVCVlnJamuzLk2',
    buttonVariant: 'default' as const,
  },
];

export function PricingCards({ inDialog = false }: PricingCardsProps) {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { execute: createCheckoutSession } = useAction(createCheckoutSessionAction, {
    onSuccess: () => {
      setProcessingPlan(null);
    },
    onError: () => {
      setProcessingPlan(null);
    },
  });

  const handleSubscribe = async (productId: string | null, planId: string) => {
    if (!productId) {
      window.location.href = routes.register;
      return;
    }
    setProcessingPlan(planId);
    createCheckoutSession({ productId });
  };

  return (
    <div className={`grid gap-6 ${inDialog ? 'md:grid-cols-3' : 'lg:grid-cols-3'}`}>
      {pricingPlans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative overflow-hidden border transition-all duration-300 ${
            !inDialog && 'hover:-translate-y-2 hover:shadow-xl'
          } ${
            plan.isPopular
              ? 'border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm hover:shadow-blue-500/20 ring-1 ring-blue-200/50 dark:border-blue-400/30 dark:from-blue-900/20 dark:to-indigo-900/20 dark:ring-blue-400/30'
              : 'border-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-blue-500/10 dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:shadow-blue-400/20'
          }`}
        >
          {plan.isPopular && (
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1">
              <span className="text-xs font-semibold text-white">POPULAR</span>
            </div>
          )}

          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className={`w-fit rounded-xl bg-gradient-to-br ${plan.gradient} p-3`}>
                <plan.icon className="size-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {plan.description}
            </CardDescription>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {plan.price}
              </span>
              <span className="ml-2 text-slate-600 dark:text-slate-400">{plan.priceDuration}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                  <span
                    className={`text-slate-700 dark:text-slate-300 ${
                      feature.includes('AI credits') ? 'font-semibold' : ''
                    }`}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant={plan.buttonVariant}
              className={`w-full ${
                plan.buttonVariant === 'default'
                  ? `bg-gradient-to-r ${plan.gradient} text-white hover:from-blue-600 hover:to-blue-700`
                  : 'border-purple-200 bg-white/50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400/30 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-purple-900/20 dark:hover:text-purple-300'
              }`}
              onClick={() => handleSubscribe(plan.productId, plan.id)}
              disabled={processingPlan === plan.id}
            >
              {processingPlan === plan.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </div>
              ) : (
                plan.buttonText
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
