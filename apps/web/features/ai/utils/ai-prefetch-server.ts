import type { QueryClient } from '@tanstack/react-query';
import { getAIModelData, getAIModelPricing } from '../queries/ai-model-pricing-queries';

export const prefetchAIModelData = async (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ['ai-model-data'],
    queryFn: getAIModelData,
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchActiveAIModelPricing = async (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ['ai-model-pricing', { is_active: true }],
    queryFn: () => getAIModelPricing({ is_active: true }),
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchAIModelOptions = async (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ['ai-models', 'options'],
    queryFn: async () => {
      const response = await fetch('/api/ai-models?type=options');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch AI model options');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchAIModelsForVideo = async (queryClient: QueryClient) => {
  return Promise.all([
    prefetchAIModelData(queryClient),
    prefetchActiveAIModelPricing(queryClient),
    prefetchAIModelOptions(queryClient),
  ]);
};
