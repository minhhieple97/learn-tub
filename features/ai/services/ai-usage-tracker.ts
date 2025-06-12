import { createAIUsageLog } from '../queries';
import type {
  ITrackAIUsageRequest,
  IAICommand,
  IAIProvider,
  ITokenUsage,
  ICostDetails,
  IAIUsageStatus,
} from '../types';

// Token cost mapping for different models
const TOKEN_COSTS = {
  openai: {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  },
  gemini: {
    'gemini-pro': { input: 0.001, output: 0.002 },
    'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
    'gemini-1.5-flash': { input: 0.00035, output: 0.00105 },
  },
  anthropic: {
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  },
} as const;

type ModelCosts = typeof TOKEN_COSTS;
type ModelName<T extends IAIProvider> = keyof ModelCosts[T];

class AIUsageTracker {
  private static instance: AIUsageTracker;

  // Singleton pattern to ensure single instance
  public static getInstance(): AIUsageTracker {
    if (!AIUsageTracker.instance) {
      AIUsageTracker.instance = new AIUsageTracker();
    }
    return AIUsageTracker.instance;
  }

  // Calculate cost based on provider, model, and token usage
  private calculateCost(
    provider: IAIProvider,
    model: string,
    tokenUsage: ITokenUsage,
  ): ICostDetails {
    const providerCosts = TOKEN_COSTS[provider];
    if (!providerCosts) {
      return {
        input_cost_per_token: 0,
        output_cost_per_token: 0,
        total_cost_usd: 0,
      };
    }

    const modelCosts = providerCosts[model as keyof typeof providerCosts] as
      | { input: number; output: number }
      | undefined;
    if (!modelCosts) {
      return {
        input_cost_per_token: 0,
        output_cost_per_token: 0,
        total_cost_usd: 0,
      };
    }

    const inputCostPerThousand = modelCosts.input;
    const outputCostPerThousand = modelCosts.output;

    const inputCostPerToken = inputCostPerThousand / 1000;
    const outputCostPerToken = outputCostPerThousand / 1000;

    const totalCost =
      tokenUsage.input_tokens * inputCostPerToken + tokenUsage.output_tokens * outputCostPerToken;

    return {
      input_cost_per_token: inputCostPerToken,
      output_cost_per_token: outputCostPerToken,
      total_cost_usd: totalCost,
    };
  }

  // Track AI usage with automatic cost calculation
  public async trackUsage(params: {
    user_id: string;
    command: IAICommand;
    provider: IAIProvider;
    model: string;
    status: IAIUsageStatus;
    token_usage?: ITokenUsage;
    request_duration_ms?: number;
    error_message?: string;
    request_payload?: any;
    response_payload?: any;
  }): Promise<void> {
    try {
      let costDetails: ICostDetails | undefined;
      let totalTokens = 0;

      if (params.token_usage) {
        costDetails = this.calculateCost(params.provider, params.model, params.token_usage);
        totalTokens = params.token_usage.total_tokens;
      }

      const trackingData: ITrackAIUsageRequest = {
        user_id: params.user_id,
        command: params.command,
        provider: params.provider,
        model: params.model,
        status: params.status,
        tokens_used: totalTokens || undefined,
        input_tokens: params.token_usage?.input_tokens,
        output_tokens: params.token_usage?.output_tokens,
        cost_usd: costDetails?.total_cost_usd,
        request_duration_ms: params.request_duration_ms,
        error_message: params.error_message,
        request_payload: params.request_payload,
        response_payload: params.response_payload,
      };

      await createAIUsageLog(trackingData);
    } catch (error) {
      // Log error but don't throw to avoid breaking the main AI operation
      console.error('Failed to track AI usage:', error);
    }
  }

  // Create a wrapper function to track AI operations
  public async wrapAIOperation<T>(
    params: {
      user_id: string;
      command: IAICommand;
      provider: IAIProvider;
      model: string;
      request_payload?: any;
    },
    operation: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    let status: IAIUsageStatus = 'success';
    let errorMessage: string | undefined;
    let result: T;

    try {
      result = await operation();
      return result;
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;

      // Track the usage
      await this.trackUsage({
        user_id: params.user_id,
        command: params.command,
        provider: params.provider,
        model: params.model,
        status,
        request_duration_ms: duration,
        error_message: errorMessage,
        request_payload: params.request_payload,
        response_payload: status === 'success' ? { success: true } : undefined,
      });
    }
  }

  // Enhanced wrapper with token usage tracking
  public async wrapAIOperationWithTokens<T>(
    params: {
      user_id: string;
      command: IAICommand;
      provider: IAIProvider;
      model: string;
      request_payload?: any;
    },
    operation: () => Promise<{ result: T; tokenUsage?: ITokenUsage }>,
  ): Promise<T> {
    const startTime = Date.now();
    let status: IAIUsageStatus = 'success';
    let errorMessage: string | undefined;
    let tokenUsage: ITokenUsage | undefined;
    let result: T;

    try {
      const operationResult = await operation();
      result = operationResult.result;
      tokenUsage = operationResult.tokenUsage;
      return result;
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;

      // Track the usage with token information
      await this.trackUsage({
        user_id: params.user_id,
        command: params.command,
        provider: params.provider,
        model: params.model,
        status,
        token_usage: tokenUsage,
        request_duration_ms: duration,
        error_message: errorMessage,
        request_payload: params.request_payload,
        response_payload: status === 'success' ? { success: true } : undefined,
      });
    }
  }

  // Get supported models for a provider
  public getSupportedModels(provider: IAIProvider): string[] {
    const providerCosts = TOKEN_COSTS[provider];
    return Object.keys(providerCosts);
  }

  // Get cost estimation for a request
  public estimateCost(
    provider: IAIProvider,
    model: string,
    estimatedTokens: { input: number; output: number },
  ): ICostDetails {
    return this.calculateCost(provider, model, {
      input_tokens: estimatedTokens.input,
      output_tokens: estimatedTokens.output,
      total_tokens: estimatedTokens.input + estimatedTokens.output,
    });
  }

  // Batch tracking for multiple operations
  public async trackBatchUsage(usageData: ITrackAIUsageRequest[]): Promise<void> {
    try {
      await Promise.all(usageData.map((data) => createAIUsageLog(data)));
    } catch (error) {
      console.error('Failed to track batch AI usage:', error);
    }
  }

  public async wrapStreamingOperationWithTokens<T>(
    params: {
      user_id: string;
      command: IAICommand;
      provider: IAIProvider;
      model: string;
      request_payload?: any;
    },
    operation: () => Promise<{ result: T; getUsage: () => Promise<ITokenUsage | undefined> }>,
  ): Promise<T> {
    const startTime = Date.now();
    let status: IAIUsageStatus = 'success';
    let errorMessage: string | undefined;
    let tokenUsage: ITokenUsage | undefined;
    let result: T;

    try {
      const operationResult = await operation();
      result = operationResult.result;

      // Get usage information asynchronously
      try {
        tokenUsage = await operationResult.getUsage();
      } catch (usageError) {
        console.warn('Failed to get token usage information:', usageError);
      }

      return result;
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;

      // Track the usage with token information
      await this.trackUsage({
        user_id: params.user_id,
        command: params.command,
        provider: params.provider,
        model: params.model,
        status,
        token_usage: tokenUsage,
        request_duration_ms: duration,
        error_message: errorMessage,
        request_payload: params.request_payload,
        response_payload:
          status === 'success' ? { success: true, has_usage: !!tokenUsage } : undefined,
      });
    }
  }

  // Wrapper for streaming operations that returns a stream
  public async wrapStreamingOperation<T extends ReadableStream<any>>(
    params: {
      user_id: string;
      command: IAICommand;
      provider: IAIProvider;
      model: string;
      request_payload?: any;
    },
    operation: () => Promise<{ stream: T; getUsage: () => Promise<ITokenUsage | undefined> }>,
  ): Promise<T> {
    const startTime = Date.now();
    let status: IAIUsageStatus = 'success';
    let errorMessage: string | undefined;
    let result: T;

    try {
      const operationResult = await operation();
      result = operationResult.stream;

      // Set up background usage tracking
      operationResult.getUsage().then(
        (tokenUsage) => {
          const duration = Date.now() - startTime;
          this.trackUsage({
            user_id: params.user_id,
            command: params.command,
            provider: params.provider,
            model: params.model,
            status: 'success',
            token_usage: tokenUsage,
            request_duration_ms: duration,
            error_message: undefined,
            request_payload: params.request_payload,
            response_payload: { success: true, has_usage: !!tokenUsage },
          }).catch((error) => {
            console.error('Background usage tracking failed:', error);
          });
        },
        (usageError) => {
          console.warn('Failed to get token usage information:', usageError);
          const duration = Date.now() - startTime;
          this.trackUsage({
            user_id: params.user_id,
            command: params.command,
            provider: params.provider,
            model: params.model,
            status: 'success',
            token_usage: undefined,
            request_duration_ms: duration,
            error_message: undefined,
            request_payload: params.request_payload,
            response_payload: {
              success: true,
              has_usage: false,
              usage_error: usageError instanceof Error ? usageError.message : 'Unknown usage error',
            },
          }).catch((error) => {
            console.error('Background usage tracking failed:', error);
          });
        },
      );

      return result;
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Track error immediately
      const duration = Date.now() - startTime;
      await this.trackUsage({
        user_id: params.user_id,
        command: params.command,
        provider: params.provider,
        model: params.model,
        status,
        token_usage: undefined,
        request_duration_ms: duration,
        error_message: errorMessage,
        request_payload: params.request_payload,
        response_payload: undefined,
      });

      throw error;
    }
  }
}

// Export singleton instance
export const aiUsageTracker = AIUsageTracker.getInstance();
