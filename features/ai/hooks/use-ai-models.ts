'use client';

import { useQuery } from '@tanstack/react-query';
import type { IAIModelOption, IAIModelPricingView, IAIModelProvider, IAIModelData } from '../types';

type IUseAIModelsOptions = {
  provider_id?: string;
  model_name?: string;
  is_active?: boolean;
  type?: 'all' | 'options' | 'provider';
  enabled?: boolean;
};

const fetchAIModels = async (options: IUseAIModelsOptions) => {
  const searchParams = new URLSearchParams();

  if (options.provider_id) searchParams.set('provider_id', options.provider_id);
  if (options.model_name) searchParams.set('model_name', options.model_name);
  if (typeof options.is_active === 'boolean')
    searchParams.set('is_active', String(options.is_active));
  if (options.type) searchParams.set('type', options.type);

  const response = await fetch(`/api/ai-models?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to fetch AI models');
  }

  return response.json();
};

export const useAIModels = (options: IUseAIModelsOptions = {}) => {
  const { provider_id, model_name, is_active, type = 'all', enabled = true } = options;

  return useQuery<IAIModelPricingView[]>({
    queryKey: ['ai-models', { provider_id, model_name, is_active, type }],
    queryFn: () => fetchAIModels(options),
    enabled,
  });
};

export const useAIModelOptions = (enabled = true) => {
  return useQuery<IAIModelOption[]>({
    queryKey: ['ai-models', 'options'],
    queryFn: () => fetchAIModels({ type: 'options' }),
    enabled,
  });
};

export const useAIModelOptionsByProvider = (providerId: string, enabled = true) => {
  return useQuery<IAIModelOption[]>({
    queryKey: ['ai-models', 'provider', providerId],
    queryFn: () => fetchAIModels({ type: 'provider', provider_id: providerId }),
    enabled: enabled && !!providerId,
  });
};

export const useAIProviders = (enabled = true) => {
  return useQuery<IAIModelProvider[]>({
    queryKey: ['ai-providers'],
    queryFn: async () => {
      const response = await fetch('/api/ai-models?type=providers');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch AI providers');
      }
      return response.json();
    },
    enabled,
  });
};

export const useAIModelData = (enabled = true) => {
  return useQuery<IAIModelData>({
    queryKey: ['ai-model-data'],
    queryFn: async () => {
      const response = await fetch('/api/ai-models?type=all');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch AI model data');
      }
      return response.json();
    },
    enabled,
  });
};
