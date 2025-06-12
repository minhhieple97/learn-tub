import { createClient } from '@/lib/supabase/server';
import {
  IAICommand,
  IAIProvider,
  IAIUsageAnalytics,
  IAIUsageByCommand,
  IAIUsageByModel,
  IAIUsageByProvider,
  IAIUsageFilters,
  IAIUsageLog,
  IAIUsageLogInsert,
} from '../types';
import { AI_PROVIDERS } from '@/config/constants';

export const createAIUsageLog = async (data: IAIUsageLogInsert): Promise<IAIUsageLog> => {
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from('ai_usage_logs')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create AI usage log: ${error.message}`);
  }

  return result;
};

export const getAIUsageLogs = async (filters: IAIUsageFilters = {}): Promise<IAIUsageLog[]> => {
  const supabase = await createClient();

  let query = supabase.from('ai_usage_logs').select('*');

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters.provider) {
    query = query.eq('provider', filters.provider);
  }
  if (filters.model) {
    query = query.eq('model', filters.model);
  }
  if (filters.command) {
    query = query.eq('command', filters.command);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get AI usage logs: ${error.message}`);
  }

  return data || [];
};

export const getAIUsageAnalytics = async (
  filters: Omit<IAIUsageFilters, 'limit' | 'offset'> = {},
): Promise<IAIUsageAnalytics> => {
  const supabase = await createClient();

  let query = supabase.from('ai_usage_logs').select('*');

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters.provider) {
    query = query.eq('provider', filters.provider);
  }
  if (filters.model) {
    query = query.eq('model', filters.model);
  }
  if (filters.command) {
    query = query.eq('command', filters.command);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get AI usage analytics: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      total_tokens: 0,
      total_cost_usd: 0,
      average_request_duration_ms: 0,
      most_used_provider: '',
      most_used_model: '',
      most_used_command: '',
    };
  }

  const totalRequests = data.length;
  const successfulRequests = data.filter((log) => log.status === 'success').length;
  const failedRequests = totalRequests - successfulRequests;
  const totalTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
  const totalCost = data.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
  const durations = data
    .filter((log) => log.request_duration_ms)
    .map((log) => log.request_duration_ms!);
  const averageDuration =
    durations.length > 0 ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length : 0;

  const providerCounts = data.reduce((acc, log) => {
    acc[log.provider] = (acc[log.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modelCounts = data.reduce((acc, log) => {
    acc[log.model] = (acc[log.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commandCounts = data.reduce((acc, log) => {
    acc[log.command] = (acc[log.command] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedProvider =
    Object.entries(providerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const mostUsedModel = Object.entries(modelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const mostUsedCommand = Object.entries(commandCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  return {
    total_requests: totalRequests,
    successful_requests: successfulRequests,
    failed_requests: failedRequests,
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    average_request_duration_ms: averageDuration,
    most_used_provider: mostUsedProvider,
    most_used_model: mostUsedModel,
    most_used_command: mostUsedCommand,
  };
};

export const getAIUsageByProvider = async (
  filters: Omit<IAIUsageFilters, 'limit' | 'offset' | 'provider'> = {},
): Promise<IAIUsageByProvider[]> => {
  const providers: IAIProvider[] = [AI_PROVIDERS.OPENAI, AI_PROVIDERS.GEMINI];

  const results = await Promise.all(
    providers.map(async (provider) => {
      const analytics = await getAIUsageAnalytics({ ...filters, provider });
      return {
        provider,
        analytics,
      };
    }),
  );

  return results.filter((result) => result.analytics.total_requests > 0);
};

export const getAIUsageByModel = async (
  filters: Omit<IAIUsageFilters, 'limit' | 'offset' | 'model'> = {},
): Promise<IAIUsageByModel[]> => {
  const supabase = await createClient();

  let query = supabase.from('ai_usage_logs').select('model, provider');

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters.provider) {
    query = query.eq('provider', filters.provider);
  }
  if (filters.command) {
    query = query.eq('command', filters.command);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get models: ${error.message}`);
  }

  const uniqueModels = Array.from(
    new Set(data?.map((item) => `${item.model}:${item.provider}`) || []),
  ).map((combined) => {
    const [model, provider] = combined.split(':');
    return { model, provider: provider as IAIProvider };
  });

  const results = await Promise.all(
    uniqueModels.map(async ({ model, provider }) => {
      const analytics = await getAIUsageAnalytics({ ...filters, model, provider });
      return {
        model,
        provider,
        analytics,
      };
    }),
  );

  return results.filter((result) => result.analytics.total_requests > 0);
};

export const getAIUsageByCommand = async (
  filters: Omit<IAIUsageFilters, 'limit' | 'offset' | 'command'> = {},
): Promise<IAIUsageByCommand[]> => {
  const commands: IAICommand[] = [
    'evaluate_note',
    'generate_quiz_questions',
    'evaluate_quiz_answers',
    'chat_completion',
    'text_generation',
  ];

  const results = await Promise.all(
    commands.map(async (command) => {
      const analytics = await getAIUsageAnalytics({ ...filters, command });
      return {
        command,
        analytics,
      };
    }),
  );

  return results.filter((result) => result.analytics.total_requests > 0);
};

export const getUserAIUsageStats = async (userId: string): Promise<IAIUsageAnalytics> => {
  return getAIUsageAnalytics({ user_id: userId });
};

export const getRecentAIUsageLogs = async (userId: string, limit = 10): Promise<IAIUsageLog[]> => {
  return getAIUsageLogs({
    user_id: userId,
    limit,
    offset: 0,
  });
};
