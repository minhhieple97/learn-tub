"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  IAIModelOption,
  IAIModelPricingView,
  IAIModelProvider,
  IAIModelData,
} from "../types";

type IUseAIModelsOptions = {
  provider_id?: string;
  model_name?: string;
  is_active?: boolean;
  type?: 'all' | 'options' | 'provider' | 'providers';
  enabled?: boolean;
};

// Constants for cache configuration and timeouts
export const AI_MODELS_CONFIG = {
  CACHE_TIMES: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    GC_TIME: 10 * 60 * 1000, // 10 minutes
  },
  REQUEST_TIMEOUT: 10000, // 10 seconds
  RETRY_COUNT: 3,
  MAX_RETRY_DELAY: 30000, // 30 seconds
} as const;

const fetchAIModels = async (options: IUseAIModelsOptions) => {
  const searchParams = new URLSearchParams();

  if (options.provider_id) searchParams.set('provider_id', options.provider_id);
  if (options.model_name) searchParams.set('model_name', options.model_name);
  if (typeof options.is_active === 'boolean')
    searchParams.set('is_active', String(options.is_active));
  if (options.type) searchParams.set('type', options.type);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_MODELS_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(`/api/ai-models?${searchParams.toString()}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to fetch AI models');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Optimized cache configuration constants
const AI_MODELS_CACHE_CONFIG = {
  staleTime: AI_MODELS_CONFIG.CACHE_TIMES.STALE_TIME,
  gcTime: AI_MODELS_CONFIG.CACHE_TIMES.GC_TIME,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: AI_MODELS_CONFIG.RETRY_COUNT,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, AI_MODELS_CONFIG.MAX_RETRY_DELAY),
} as const;

export const useAIModels = (options: IUseAIModelsOptions = {}) => {
  const {
    provider_id,
    model_name,
    is_active,
    type = "all",
    enabled = true,
  } = options;

  return useQuery<IAIModelPricingView[]>({
    queryKey: ["ai-models", { provider_id, model_name, is_active, type }],
    queryFn: () => fetchAIModels(options),
    enabled,
    ...AI_MODELS_CACHE_CONFIG,
  });
};

export const useAIModelOptions = (enabled = true) => {
  return useQuery<IAIModelOption[]>({
    queryKey: ["ai-models", "options"],
    queryFn: () => fetchAIModels({ type: "options" }),
    enabled,
    ...AI_MODELS_CACHE_CONFIG,
  });
};

export const useAIModelOptionsByProvider = (
  providerId: string,
  enabled = true,
) => {
  return useQuery<IAIModelOption[]>({
    queryKey: ["ai-models", "provider", providerId],
    queryFn: () => fetchAIModels({ type: "provider", provider_id: providerId }),
    enabled: enabled && !!providerId,
    ...AI_MODELS_CACHE_CONFIG,
  });
};

export const useAIProviders = (enabled = true) => {
  return useQuery<IAIModelProvider[]>({
    queryKey: ["ai-providers"],
    queryFn: async () => {
      const response = await fetch("/api/ai-models?type=providers");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch AI providers");
      }
      return response.json();
    },
    enabled,
    ...AI_MODELS_CACHE_CONFIG,
  });
};

export const useAIModelData = (enabled = true) => {
  return useQuery<IAIModelData>({
    queryKey: ["ai-model-data"],
    queryFn: async () => {
      const response = await fetch("/api/ai-models?type=all");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch AI model data");
      }
      return response.json();
    },
    enabled,
    ...AI_MODELS_CACHE_CONFIG,
  });
};
