import { useQuery } from "@tanstack/react-query";
import { getAIModelPricing } from "../queries/ai-model-pricing-queries";
import type { IAIModelPricingFilters } from "../types";

export const AI_MODEL_PRICING_CACHE_TIMES = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
} as const;

const AI_MODEL_PRICING_CACHE_CONFIG = {
  staleTime: AI_MODEL_PRICING_CACHE_TIMES.STALE_TIME,
  gcTime: AI_MODEL_PRICING_CACHE_TIMES.GC_TIME,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
} as const;

export const useAIModelPricing = (filters: IAIModelPricingFilters = {}) => {
  return useQuery({
    queryKey: ["ai-model-pricing", filters],
    queryFn: () => getAIModelPricing(filters),
    ...AI_MODEL_PRICING_CACHE_CONFIG,
  });
};
