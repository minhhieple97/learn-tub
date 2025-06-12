import { type Tables, type TablesInsert, type TablesUpdate, type Json } from '@/database.types';
import { z } from 'zod';
import { IAICommandSchema, IAIProviderSchema } from './schemas';

export type IAIUsageLog = Tables<'ai_usage_logs'>;
export type IAIUsageLogInsert = TablesInsert<'ai_usage_logs'>;
export type IAIUsageLogUpdate = TablesUpdate<'ai_usage_logs'>;

export type IAIUsageStatus = 'success' | 'error';

export type IAICommand = z.infer<typeof IAICommandSchema>;

export type IAIProvider = z.infer<typeof IAIProviderSchema>;

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
  provider: IAIProvider;
  model: string;
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
  provider: IAIProvider;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageByModel = {
  model: string;
  provider: IAIProvider;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageByCommand = {
  command: IAICommand;
  analytics: IAIUsageAnalytics;
};

export type IAIUsageFilters = {
  user_id?: string;
  provider?: IAIProvider;
  model?: string;
  command?: IAICommand;
  status?: IAIUsageStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};
