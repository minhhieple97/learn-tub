import { createAIUsageLog } from '../queries';
import type {
  ITrackAIUsageRequest,
  IAICommand,
  ITokenUsage,
  ICostDetails,
  IAIUsageStatus,
} from '../types';
import { createClient } from '@/lib/supabase/server';

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
  private async calculateCost(ai_model_id: string, tokenUsage: ITokenUsage): Promise<ICostDetails> {
    const supabase = await createClient();
    const { data: modelData, error } = await supabase
      .from('ai_model_pricing')
      .select('input_cost_per_million_tokens, output_cost_per_million_tokens')
      .eq('id', ai_model_id)
      .single();

    if (error || !modelData) {
      return {
        input_cost_per_token: 0,
        output_cost_per_token: 0,
        total_cost_usd: 0,
      };
    }

    const inputCostPerToken = modelData.input_cost_per_million_tokens / 1_000_000;
    const outputCostPerToken = modelData.output_cost_per_million_tokens / 1_000_000;

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
    ai_model_id: string;
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
        costDetails = await this.calculateCost(params.ai_model_id, params.token_usage);
        totalTokens = params.token_usage.total_tokens;
      }

      const trackingData: ITrackAIUsageRequest = {
        user_id: params.user_id,
        command: params.command,
        ai_model_id: params.ai_model_id,
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
      ai_model_id: string;
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
        ai_model_id: params.ai_model_id,
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
      ai_model_id: string;
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
        ai_model_id: params.ai_model_id,
        status,
        token_usage: tokenUsage,
        request_duration_ms: duration,
        error_message: errorMessage,
        request_payload: params.request_payload,
        response_payload: status === 'success' ? { success: true } : undefined,
      });
    }
  }

  // Get cost estimation for a request
  public async estimateCost(
    providerId: string,
    estimatedTokens: { input: number; output: number },
  ): Promise<ICostDetails> {
    return this.calculateCost(providerId, {
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
      ai_model_id: string;
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
        ai_model_id: params.ai_model_id,
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

  public async wrapStreamingOperation<T extends ReadableStream<any>>(
    params: {
      user_id: string;
      command: IAICommand;
      ai_model_id: string;
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
            ai_model_id: params.ai_model_id,
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
            ai_model_id: params.ai_model_id,
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
        ai_model_id: params.ai_model_id,
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
