'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Crown, Sparkles } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { createCheckoutSessionAction } from '@/features/payments/actions';

const pricingPlans = [
  {
    name: 'Pro',
    price: '$2',
    priceDuration: '/month',
    description: 'Perfect for serious learners who want more AI-powered insights',
    features: [
      '500 AI credits per month',
      'Advanced AI analysis',
      'Priority support',
      'Export capabilities',
      'Progress tracking',
      'Custom study plans',
    ],
    buttonText: 'Start Pro Trial',
    isPopular: true,
    icon: Star,
    iconColor: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-600',
    productId: 'prod_SVCVKAQ94lH5CT',
    highlight: 'Most Popular',
  },
  {
    name: 'Premium',
    price: '$5',
    priceDuration: '/month',
    description: 'For power users and professional learners who need everything',
    features: [
      '1,500 AI credits per month',
      'Premium AI models',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Team collaboration',
      'Custom integrations',
      'Advanced reporting',
    ],
    buttonText: 'Go Premium',
    isPopular: false,
    icon: Crown,
    iconColor: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-600',
    productId: 'prod_SVCVlnJamuzLk2',
    highlight: 'Best Value',
  },
];

export const PricingPlans = () => {
  const { execute: createCheckoutSession, isExecuting } = useAction(createCheckoutSessionAction);

  const handleSubscribe = async (productId: string) => {
    await createCheckoutSession({ productId });
  };

  return (
    <div className="py-12">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-indigo-600 mr-2" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock the full potential of AI-powered learning with our flexible pricing plans. Start
          your journey to smarter learning today.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              plan.isPopular
                ? 'border-indigo-200 ring-4 ring-indigo-100 dark:border-indigo-400 dark:ring-indigo-900 shadow-indigo-100/50 dark:shadow-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
            } bg-white dark:bg-gray-800`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {plan.highlight}
                </div>
              </div>
            )}

            <CardHeader className="pb-6 pt-8">
              <div className="flex items-center justify-center">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 mb-4 shadow-lg`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                {plan.name}
              </CardTitle>

              <CardDescription className="text-center text-gray-600 dark:text-gray-400 text-base">
                {plan.description}
              </CardDescription>

              <div className="flex items-baseline justify-center mt-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                {plan.priceDuration && (
                  <span className="ml-2 text-xl text-gray-600 dark:text-gray-400">
                    {plan.priceDuration}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full h-12 text-base font-semibold ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                } transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                onClick={() => handleSubscribe(plan.productId!)}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </Button>

              {/* Additional info */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Cancel anytime • No hidden fees • 14-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="text-center mt-16">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Need a custom plan for your team or organization?
        </p>
        <Button variant="outline" size="lg" className="font-semibold">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};
