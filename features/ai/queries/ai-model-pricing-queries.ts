'server-only';

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import type {
  IAIModelPricing,
  IAIModelPricingView,
  IAIModelPricingFilters,
  IAIModelOption,
} from '../types';

export const getAIModelPricing = cache(
  async (filters: IAIModelPricingFilters = {}): Promise<IAIModelPricingView[]> => {
    const supabase = await createClient();
    let query = supabase
      .from('ai_model_pricing_view')
      .select('*')
      .order('provider_name', { ascending: true })
      .order('model_name', { ascending: true });

    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }

    if (filters.model_name) {
      query = query.eq('model_name', filters.model_name);
    }

    if (typeof filters.is_active === 'boolean') {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AI model pricing:', error);
      throw error;
    }

    return data as IAIModelPricingView[];
  },
);

export const getAIModelOptions = cache(async (): Promise<IAIModelOption[]> => {
  const pricing = await getAIModelPricing({ is_active: true });

  return pricing.map((item) => ({
    value: item.model_name,
    label: item.model_name,
    provider_id: item.id,
    provider_name: item.provider_name,
    provider_display_name: item.provider_display_name,
    input_cost_per_million_tokens: item.input_cost_per_million_tokens,
    output_cost_per_million_tokens: item.output_cost_per_million_tokens,
    ai_model_id: item.id,
  }));
});

export const getAIModelOptionsByProvider = cache(
  async (providerId: string): Promise<IAIModelOption[]> => {
    const pricing = await getAIModelPricing({ provider_id: providerId, is_active: true });

    return pricing.map((item) => ({
      value: item.model_name,
      label: item.model_name,
      provider_id: item.id,
      provider_name: item.provider_name,
      provider_display_name: item.provider_display_name,
      input_cost_per_million_tokens: item.input_cost_per_million_tokens,
      output_cost_per_million_tokens: item.output_cost_per_million_tokens,
      ai_model_id: item.id,
    }));
  },
);

export type IAIModelProvider = {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
};

export const getAIProviders = cache(async (): Promise<IAIModelProvider[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ai_providers')
    .select('id, name, display_name, is_active')
    .eq('is_active', true)
    .order('display_name', { ascending: false });

  if (error) {
    console.error('Error fetching AI providers:', error);
    throw error;
  }

  return data as IAIModelProvider[];
});

export type IAIModelData = {
  providers: IAIModelProvider[];
  modelOptions: IAIModelOption[];
};

export const getAIModelData = cache(async (): Promise<IAIModelData> => {
  const [providers, modelOptions] = await Promise.all([getAIProviders(), getAIModelOptions()]);

  return {
    providers,
    modelOptions,
  };
});
