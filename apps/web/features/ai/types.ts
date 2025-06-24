import { type Tables, type TablesInsert, type TablesUpdate, type Json } from '@/database.types';
import { z } from 'zod';
import { IAICommandSchema } from './schemas';

export type IAIUsageLog = Tables<'ai_usage_logs'>;
export type IAIUsageLogInsert = TablesInsert<'ai_usage_logs'>;
export type IAIUsageLogUpdate = TablesUpdate<'ai_usage_logs'>;

export type IAIUsageStatus = 'success' | 'error';

export type IAICommand = z.infer<typeof IAICommandSchema>;

export type ITokenUsage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
};

export type ICostDetails = {
  input_cost_per_token: number;
  output_cost_per_token: number;
  total_cost_usd: number;
};

export type ITrackAIUsageRequest = {
  user_id: string;
  command: IAICommand;
  ai_model_id: string;
  status: IAIUsageStatus;
  tokens_used?: number;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  request_duration_ms?: number;
  error_message?: string;
  request_payload?: Json;
  response_payload?: Json;
};

export type IAIUsageAnalytics = {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  average_request_duration_ms: number;
  most_used_provider: string;
  most_used_model: string;
  most_used_command: string;
};

export type IAIUsageTimeRange = 'day' | 'week' | 'month' | 'year';

export type IAIUsageByTimeRange = {
  time_range: IAIUsageTimeRange;
  period_start: string;
  period_end: string;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageByProvider = {
  provider: string;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageByModel = {
  model: string;
  provider: string;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageByCommand = {
  command: IAICommand;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageFilters = {
  user_id?: string;
  provider?: string;
  model?: string;
  command?: IAICommand;
  status?: IAIUsageStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export type IAIMessage = {
  role: string;
  content: string;
};

export type IAICompletionRequest = {
  model: string;
  messages: IAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  stream_options?: {
    include_usage?: boolean;
  };
};

export type IAICompletionResponse = {
  choices: Array<{
    message?: {
      content: string;
    };
    delta?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type IAIStreamChunk = {
  choices: Array<{
    delta?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type IAIModelPricing = {
  id: string;
  provider_id: string;
  model_name: string;
  input_cost_per_million_tokens: number;
  output_cost_per_million_tokens: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type IAIModelPricingView = {
  id: string;
  provider_name: string;
  provider_display_name: string;
  model_name: string;
  input_cost_per_million_tokens: number;
  output_cost_per_million_tokens: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type IAIModelPricingFilters = {
  provider_id?: string;
  model_name?: string;
  is_active?: boolean;
};

export type IAIModelOption = {
  value: string;
  label: string;
  provider_id: string;
  provider_name: string;
  provider_display_name: string;
  input_cost_per_million_tokens: number;
  output_cost_per_million_tokens: number;
  ai_model_id: string;
};

export type IAIModelProvider = {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
};

export type IAIModelData = {
  providers: IAIModelProvider[];
  modelOptions: IAIModelOption[];
};