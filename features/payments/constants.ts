import { IPricingData } from './types';

export const USER_SUBSCRIPTION_QUERY_KEY = 'user-subscription';
export const USER_SUBSCRIPTION_QUERY_URL = '/api/user/subscription';

export const PLAN_ID_MAPPING: Record<string, string> = {
  pro: 'b06b6ec8-6a58-4035-9f5c-a281a7aa8e10',
  premium: 'c2a6edeb-a5aa-4c2a-aa3f-e810c44962f4',
};

export const PRICING_DATA: IPricingData = {
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
      productId: null,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$2',
      color: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-purple-600',
      productId: 'prod_SVCVKAQ94lH5CT',
    },
  ],
  features: [
    {
      name: 'AI Credits',
      values: ['50 credits/month', '500 credits/month'],
    },
    {
      name: 'Note Taking',
      values: ['Unlimited', 'Unlimited'],
    },
    {
      name: 'AI Analysis',
      values: ['Basic', 'Advanced'],
    },
    {
      name: 'Support',
      values: ['Email', 'Priority'],
    },
    {
      name: 'Export',
      values: [false, true],
    },
  ],
};
