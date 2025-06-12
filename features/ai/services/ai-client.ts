import { env } from '@/env.mjs';
import {
  AI_CONFIG,
  AI_DEFAULTS,
  AI_PROVIDERS,
  AI_CHAT_ROLES,
  AI_API,
  HTTP_CONFIG,
  API_ERROR_MESSAGES,
} from '@/config/constants';
import {
  IAICompletionRequest,
  IAICompletionResponse,
  IAIStreamChunk,
  IAIMessage,
  ITokenUsage,
} from '@/features/ai/types';

abstract class BaseAIProvider<T extends IAICompletionRequest> {
  protected readonly baseUrl: string;
  protected readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  abstract getAuthHeader(): Record<string, string>;
  abstract getDefaultModel(): string;

  protected createHeaders(): Record<string, string> {
    return {
      'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE,
      ...this.getAuthHeader(),
    };
  }

  protected createRequestBody(request: T): string {
    return JSON.stringify({
      model: request.model || this.getDefaultModel(),
      messages: request.messages,
      temperature: request.temperature ?? AI_CONFIG.TEMPERATURE,
      max_tokens: request.max_tokens ?? AI_CONFIG.MAX_TOKENS,
      stream: request.stream,
      stream_options: request.stream_options,
    });
  }

  async makeRequest(request: T): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${AI_API.CHAT_COMPLETIONS_PATH}`, {
      method: HTTP_CONFIG.METHODS.POST,
      headers: this.createHeaders(),
      body: this.createRequestBody(request),
    });

    if (!response.ok) {
      throw new Error(`${this.getErrorMessage()}: ${response.statusText}`);
    }

    return response;
  }

  abstract getErrorMessage(): string;
}

class OpenAIProvider extends BaseAIProvider<IAICompletionRequest> {
  constructor() {
    super(AI_CONFIG.BASE_URL, env.OPENAI_API_KEY);
  }

  getAuthHeader(): Record<string, string> {
    return {
      Authorization: `${HTTP_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${this.apiKey}`,
    };
  }

  getDefaultModel(): string {
    return AI_DEFAULTS.OPENAI_MODEL;
  }

  getErrorMessage(): string {
    return API_ERROR_MESSAGES.OPENAI_REQUEST_FAILED;
  }
}

class GeminiProvider extends BaseAIProvider<IAICompletionRequest> {
  constructor() {
    super(AI_CONFIG.BASE_URL, env.GEMINI_API_KEY);
  }

  getAuthHeader(): Record<string, string> {
    return {
      Authorization: `${HTTP_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${this.apiKey}`,
    };
  }

  getDefaultModel(): string {
    return AI_DEFAULTS.GEMINI_MODEL;
  }

  getErrorMessage(): string {
    return API_ERROR_MESSAGES.GEMINI_REQUEST_FAILED;
  }
}

class AIProviderFactory {
  private static providers: Map<string, BaseAIProvider<IAICompletionRequest>> = new Map();

  static getProvider(providerType: string): BaseAIProvider<IAICompletionRequest> {
    if (!this.providers.has(providerType)) {
      switch (providerType) {
        case AI_PROVIDERS.OPENAI:
          this.providers.set(providerType, new OpenAIProvider());
          break;
        case AI_PROVIDERS.GEMINI:
          this.providers.set(providerType, new GeminiProvider());
          break;
        default:
          throw new Error(`Unsupported AI provider: ${providerType}`);
      }
    }

    return this.providers.get(providerType)!;
  }
}

export class AIClient {
  private provider: BaseAIProvider<IAICompletionRequest>;

  constructor(providerType: string) {
    this.provider = AIProviderFactory.getProvider(providerType);
  }

  async chatCompletion(request: IAICompletionRequest): Promise<string> {
    const response = await this.provider.makeRequest(request);

    if (!response.body) {
      throw new Error('No response body received');
    }

    const data: IAICompletionResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async chatCompletionWithUsage(request: IAICompletionRequest): Promise<{
    result: string;
    tokenUsage?: ITokenUsage;
  }> {
    const response = await this.provider.makeRequest(request);

    if (!response.body) {
      throw new Error('No response body received');
    }

    const data: IAICompletionResponse = await response.json();
    const result = data.choices[0]?.message?.content || '';

    let tokenUsage: ITokenUsage | undefined;
    if (data.usage) {
      tokenUsage = {
        input_tokens: data.usage.prompt_tokens,
        output_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      };
    }

    return {
      result,
      tokenUsage,
    };
  }

  async streamChatCompletion(request: IAICompletionRequest): Promise<ReadableStream<Uint8Array>> {
    const streamRequest = { ...request, stream: true };
    const response = await this.provider.makeRequest(streamRequest);

    if (!response.body) {
      throw new Error('No response body received for streaming');
    }

    return response.body;
  }

  async streamChatCompletionWithUsage(request: IAICompletionRequest): Promise<{
    stream: ReadableStream<Uint8Array>;
    getUsage: () => Promise<ITokenUsage | undefined>;
  }> {
    const streamRequest = { ...request, stream: true, stream_options: { include_usage: true } };
    const response = await this.provider.makeRequest(streamRequest);

    if (!response.body) {
      throw new Error('No response body received for streaming');
    }

    let capturedUsage: ITokenUsage | undefined;
    const usagePromiseResolvers: {
      resolve: (value: ITokenUsage | undefined) => void;
      reject: (reason?: unknown) => void;
    }[] = [];

    // Create a transformed stream that captures usage information
    const transformedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value);

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                const data = line.slice(AI_API.SSE_DATA_PREFIX_LENGTH).trim();
                if (data === AI_API.SSE_DONE_MESSAGE) continue;

                try {
                  const parsed: IAIStreamChunk = JSON.parse(data);
                  if (parsed.usage) {
                    capturedUsage = {
                      input_tokens: parsed.usage.prompt_tokens,
                      output_tokens: parsed.usage.completion_tokens,
                      total_tokens: parsed.usage.total_tokens,
                    };
                    usagePromiseResolvers.forEach(({ resolve }) => resolve(capturedUsage));
                    usagePromiseResolvers.length = 0;
                  }
                } catch (error) {
                  console.error('Failed to parse streaming chunk for usage:', error);
                }
              }
            }
          }

          if (buffer.trim()) {
            const remainingLines = buffer.split('\n');
            for (const line of remainingLines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                const data = line.slice(AI_API.SSE_DATA_PREFIX_LENGTH).trim();
                if (data === AI_API.SSE_DONE_MESSAGE) continue;

                try {
                  const parsed: IAIStreamChunk = JSON.parse(data);
                  if (parsed.usage) {
                    capturedUsage = {
                      input_tokens: parsed.usage.prompt_tokens,
                      output_tokens: parsed.usage.completion_tokens,
                      total_tokens: parsed.usage.total_tokens,
                    };
                    // Resolve any pending usage promises
                    usagePromiseResolvers.forEach(({ resolve }) => resolve(capturedUsage));
                    usagePromiseResolvers.length = 0;
                  }
                } catch (error) {
                  console.error('Failed to parse final streaming chunk for usage:', error);
                }
              }
            }
          }

          usagePromiseResolvers.forEach(({ resolve }) => resolve(undefined));
        } catch (error) {
          console.error('Stream processing error:', error);
          usagePromiseResolvers.forEach(({ reject }) => reject(error));
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    const getUsage = (): Promise<ITokenUsage | undefined> => {
      if (capturedUsage !== undefined) {
        return Promise.resolve(capturedUsage);
      }

      return new Promise((resolve, reject) => {
        usagePromiseResolvers.push({ resolve, reject });
      });
    };

    return {
      stream: transformedStream,
      getUsage,
    };
  }

  createStreamFromResponse(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<IAIStreamChunk> {
    return new ReadableStream<IAIStreamChunk>({
      async start(controller) {
        try {
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                const data = line.slice(AI_API.SSE_DATA_PREFIX_LENGTH).trim();
                if (data === AI_API.SSE_DONE_MESSAGE) continue;

                try {
                  const parsed: IAIStreamChunk = JSON.parse(data);
                  controller.enqueue(parsed);
                } catch (error) {
                  console.error('Failed to parse streaming chunk:', error);
                  console.error('Problematic data:', data);
                }
              }
            }
          }

          if (buffer.trim()) {
            const remainingLines = buffer.split('\n');
            for (const line of remainingLines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                const data = line.slice(AI_API.SSE_DATA_PREFIX_LENGTH).trim();
                if (data === AI_API.SSE_DONE_MESSAGE) continue;

                try {
                  const parsed: IAIStreamChunk = JSON.parse(data);
                  controller.enqueue(parsed);
                } catch (error) {
                  console.error('Failed to parse final streaming chunk:', error);
                  console.error('Problematic data:', data);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });
  }

  createSystemUserMessages(systemMessage: string, userMessage: string): IAIMessage[] {
    return [
      {
        role: AI_CHAT_ROLES.SYSTEM,
        content: systemMessage,
      },
      {
        role: AI_CHAT_ROLES.USER,
        content: userMessage,
      },
    ];
  }
}

export class AIClientFactory {
  private static clients: Map<string, AIClient> = new Map();

  static getClient(providerType: string): AIClient {
    if (!this.clients.has(providerType)) {
      this.clients.set(providerType, new AIClient(providerType));
    }

    return this.clients.get(providerType)!;
  }
}
