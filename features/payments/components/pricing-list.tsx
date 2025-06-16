'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Star, Crown, ChevronDown } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { createCheckoutSessionAction } from '../actions';

const pricingPlans = [
  {
    name: 'Pro',
    price: '$2',
    priceDuration: '/month',
    description: 'For serious learners who want more AI-powered insights',
    features: [
      '500 AI credits per month',
      'Advanced AI analysis',
      'Priority support',
      'Export capabilities',
    ],
    buttonText: 'Start Pro Trial',
    isPopular: true,
    icon: Star,
    iconColor: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-600',
    productId: 'prod_SVCVKAQ94lH5CT',
  },
  {
    name: 'Premium',
    price: '$5',
    priceDuration: '/month',
    description: 'For power users and professional learners',
    features: [
      '1,500 AI credits per month',
      'Premium AI models',
      'Advanced analytics',
      'API access',
    ],
    buttonText: 'Go Premium',
    isPopular: false,
    icon: Crown,
    iconColor: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-600',
    productId: 'prod_SVCVlnJamuzLk2',
  },
];

export const PricingList = () => {
  const { execute: createCheckoutSession, isExecuting } = useAction(
    createCheckoutSessionAction,
  );

  const handleSubscribe = async (productId: string) => {
    await createCheckoutSession({ productId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Upgrade Plan
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[800px] p-6" align="end">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Choose Your Plan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Unlock more AI-powered features to enhance your learning experience
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.isPopular
                  ? 'border-blue-200/50 ring-2 ring-blue-200/50 dark:border-blue-400/30 dark:ring-blue-400/30 shadow-blue-100/50 dark:shadow-blue-900/20'
                  : 'border-slate-200/50 dark:border-slate-700/50'
              } bg-white/90 backdrop-blur-sm dark:bg-slate-800/90`}
            >
              {plan.isPopular && (
                <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1">
                  <span className="text-xs font-semibold text-white">
                    POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-fit rounded-lg bg-gradient-to-br ${plan.gradient} p-2`}
                  >
                    <plan.icon className="size-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {plan.price}
                  </span>
                  {plan.priceDuration && (
                    <span className="ml-1 text-sm text-slate-600 dark:text-slate-400">
                      {plan.priceDuration}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full text-sm ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                  } text-white transition-all duration-300 shadow-md hover:shadow-lg`}
                  onClick={() => handleSubscribe(plan.productId!)}
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Processing...' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
