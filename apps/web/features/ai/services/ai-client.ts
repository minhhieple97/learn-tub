import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText, LanguageModel, CoreMessage } from 'ai';
import { env } from '@/env.mjs';
import { AI_CHAT_ROLES, AI_CONFIG, API_ERROR_MESSAGES } from '@/config/constants';
import { IAICompletionRequest, IAIMessage, ITokenUsage } from '@/features/ai/types';

export type AIStreamChunk = {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

class AIClient {
  private openaiClient: ReturnType<typeof createOpenAI>;
  private googleClient: ReturnType<typeof createGoogleGenerativeAI>;

  constructor() {
    this.openaiClient = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: AI_CONFIG.BASE_URL,
    });

    this.googleClient = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
      baseURL: AI_CONFIG.BASE_URL,
    });
  }

  private getModel(modelName: string): LanguageModel {
    if (modelName.startsWith('gpt-')) {
      return this.openaiClient(modelName);
    }

    if (modelName.startsWith('gemini-')) {
      return this.googleClient(modelName);
    }

    console.warn(`Unknown model: ${modelName}, defaulting to OpenAI`);
    return this.openaiClient(modelName);
  }

  private convertMessages(messages: IAIMessage[]): CoreMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  private convertTokenUsage(usage: any): ITokenUsage {
    return {
      input_tokens: usage.promptTokens || 0,
      output_tokens: usage.completionTokens || 0,
      total_tokens: usage.totalTokens || 0,
    };
  }

  async chatCompletion(request: IAICompletionRequest): Promise<string> {
    try {
      const model = this.getModel(request.model);
      const messages = this.convertMessages(request.messages);

      const result = await generateText({
        model,
        messages,
        temperature: request.temperature,
        maxTokens: request.max_tokens,
      });

      return result.text;
    } catch (error) {
      console.error('AI completion error:', error);
      throw new Error(
        `${API_ERROR_MESSAGES.OPENAI_REQUEST_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async chatCompletionWithUsage(request: IAICompletionRequest): Promise<{
    result: string;
    tokenUsage?: ITokenUsage;
  }> {
    try {
      const model = this.getModel(request.model);
      const messages = this.convertMessages(request.messages);

      const result = await generateText({
        model,
        messages,
        temperature: request.temperature,
        maxTokens: request.max_tokens,
      });

      const tokenUsage = result.usage ? this.convertTokenUsage(result.usage) : undefined;

      return {
        result: result.text,
        tokenUsage,
      };
    } catch (error) {
      console.error('AI completion with usage error:', error);
      throw new Error(
        `${API_ERROR_MESSAGES.OPENAI_REQUEST_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async streamChatCompletion(request: IAICompletionRequest): Promise<ReadableStream<Uint8Array>> {
    try {
      const model = this.getModel(request.model);
      const messages = this.convertMessages(request.messages);

      const result = streamText({
        model,
        messages,
        temperature: request.temperature,
        maxTokens: request.max_tokens,
      });

      // Convert AI SDK stream to format expected by existing code
      const encoder = new TextEncoder();

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of result.textStream) {
              const aiStreamChunk: AIStreamChunk = {
                choices: [
                  {
                    delta: {
                      content: chunk,
                    },
                  },
                ],
              };

              const sseData = `data: ${JSON.stringify(aiStreamChunk)}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }

            // Send final chunk
            const finalChunk: AIStreamChunk = {
              choices: [
                {
                  delta: {},
                  finish_reason: 'stop',
                },
              ],
            };

            const finalData = `data: ${JSON.stringify(finalChunk)}\n\n`;
            controller.enqueue(encoder.encode(finalData));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('AI streaming error:', error);
      throw new Error(
        `${API_ERROR_MESSAGES.OPENAI_REQUEST_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async streamChatCompletionWithUsage(request: IAICompletionRequest): Promise<{
    stream: ReadableStream<Uint8Array>;
    getUsage: () => Promise<ITokenUsage | undefined>;
  }> {
    try {
      const model = this.getModel(request.model);
      const messages = this.convertMessages(request.messages);

      const result = streamText({
        model,
        messages,
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        onFinish: (result) => {
          console.log('result.usage', result.usage);
          console.log('result.finishReason', result.finishReason);
        },
      });

      // Use AI SDK's built-in usage tracking instead of manual capture
      const getUsage = async (): Promise<ITokenUsage | undefined> => {
        try {
          const finalResult = await result;
          return finalResult.usage ? this.convertTokenUsage(finalResult.usage) : undefined;
        } catch (error) {
          console.error('Failed to get usage data:', error);
          return undefined;
        }
      };

      // Convert AI SDK stream to the expected format
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            // Stream text chunks
            for await (const chunk of result.textStream) {
              const aiStreamChunk: AIStreamChunk = {
                choices: [
                  {
                    delta: {
                      content: chunk,
                    },
                  },
                ],
              };

              const sseData = `data: ${JSON.stringify(aiStreamChunk)}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }

            // Wait for final result to get usage data
            const finalResult = await result;
            const usage = await finalResult.usage;
            const finishReason = await finalResult.finishReason;

            // Send final chunk with usage if available
            const finalChunk: AIStreamChunk = {
              choices: [
                {
                  delta: {},
                  finish_reason: finishReason || 'stop',
                },
              ],
              ...(usage && {
                usage: {
                  prompt_tokens: usage.promptTokens,
                  completion_tokens: usage.completionTokens,
                  total_tokens: usage.totalTokens,
                },
              }),
            };

            const finalData = `data: ${JSON.stringify(finalChunk)}\n\n`;
            controller.enqueue(encoder.encode(finalData));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return {
        stream,
        getUsage,
      };
    } catch (error) {
      console.error('AI streaming with usage error:', error);
      throw new Error(
        `${API_ERROR_MESSAGES.OPENAI_REQUEST_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  createStreamFromResponse(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<AIStreamChunk> {
    return new ReadableStream<AIStreamChunk>({
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
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed: AIStreamChunk = JSON.parse(data);
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
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed: AIStreamChunk = JSON.parse(data);
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
  private static client: AIClient | null = null;

  static getClient(): AIClient {
    if (!this.client) {
      this.client = new AIClient();
    }
    return this.client;
  }
}

// Export singleton instance for internal use
const aiClient = AIClientFactory.getClient();
export { aiClient };
