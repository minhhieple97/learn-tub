import { useQuery } from '@tanstack/react-query';
import {
  getAIModelPricing,
  getAIModelOptions,
  getAIModelOptionsByProvider,
} from '../queries/ai-model-pricing-queries';
import type { IAIModelPricingFilters, IAIModelOption } from '../types';

export const useAIModelPricing = (filters: IAIModelPricingFilters = {}) => {
  return useQuery({
    queryKey: ['ai-model-pricing', filters],
    queryFn: () => getAIModelPricing(filters),
  });
};

export const useAIModelOptions = () => {
  return useQuery({
    queryKey: ['ai-model-options'],
    queryFn: getAIModelOptions,
  });
};

export const useAIModelOptionsByProvider = (providerId: string) => {
  return useQuery({
    queryKey: ['ai-model-options', providerId],
    queryFn: () => getAIModelOptionsByProvider(providerId),
    enabled: !!providerId,
  });
};
