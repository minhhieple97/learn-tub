import OpenAI from 'openai';
import { env } from '@/env.mjs';
import {
  AI_CONFIG,
  AI_DEFAULTS,
  AI_PROVIDERS,
  CHUNK_TYPES,
  AI_CHAT_ROLES,
  AI_SYSTEM_MESSAGES,
  AI_FORMAT,
  ERROR_MESSAGES,
  EVALUATION_ERRORS,
  AI_API,
  HTTP_CONFIG,
  API_ERROR_MESSAGES,
  AI_QUIZ_CONFIG,
} from '@/config/constants';
import { INoteEvaluationRequest } from '@/features/notes/types';
import { IFeedback, StreamChunk } from '@/types';
import { aiUsageTracker } from '@/features/ai';

type StreamController = ReadableStreamDefaultController<StreamChunk>;
type ProviderEvaluator = (
  model: string,
  prompt: string,
  userId: string,
) => Promise<ReadableStream<StreamChunk>>;

class NoteService {
  async evaluateNote(request: INoteEvaluationRequest): Promise<ReadableStream<StreamChunk>> {
    const { provider, model, content, context, userId } = request;
    const prompt = this.createEvaluationPrompt(content, context);

    const evaluator = this.getProviderEvaluator(provider);
    return evaluator(model, prompt, userId);
  }

  private getProviderEvaluator(provider: string): ProviderEvaluator {
    const evaluators: Record<string, ProviderEvaluator> = {
      [AI_PROVIDERS.OPENAI]: this.evaluateWithOpenAI.bind(this),
      [AI_PROVIDERS.GEMINI]: this.evaluateWithGemini.bind(this),
    };

    const evaluator = evaluators[provider];
    if (!evaluator) {
      throw new Error(`${EVALUATION_ERRORS.UNSUPPORTED_PROVIDER}: ${provider}`);
    }

    return evaluator;
  }

  private createEvaluationPrompt(
    content: string,
    context?: INoteEvaluationRequest['context'],
  ): string {
    const contextualInfo = this.buildContextualInfo(context);

    return `
Please evaluate the following learning note and provide detailed feedback:

Note Content: "${content}"
${contextualInfo}

Please provide your evaluation in the following JSON format:
{
  "summary": "Brief overall assessment of the note",
  "correct_points": ["List of correct or well-articulated points"],
  "incorrect_points": ["List of incorrect or questionable points"],
  "improvement_suggestions": ["Specific suggestions for improvement"],
  "overall_score": number (1-10),
  "detailed_analysis": "Comprehensive analysis with explanations"
}

Focus on:
1. Accuracy of information
2. Clarity of understanding
3. Completeness of key concepts
4. Areas for improvement
5. Study effectiveness

Be constructive and educational in your feedback.`;
  }

  private buildContextualInfo(context?: INoteEvaluationRequest['context']): string {
    if (!context) return '';

    const contextParts: string[] = [];

    if (context.videoTitle) {
      contextParts.push(`Video Title: "${context.videoTitle}"`);
    }

    if (context.videoDescription) {
      contextParts.push(`Video Context: "${context.videoDescription}"`);
    }

    if (context.timestamp) {
      contextParts.push(`Timestamp: ${this.formatTimestamp(context.timestamp)}`);
    }

    return contextParts.join('\n');
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) =>
      num.toString().padStart(AI_FORMAT.TIMESTAMP_PADDING, AI_FORMAT.TIMESTAMP_PAD_CHAR);

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }

    return `${minutes}:${pad(secs)}`;
  }

  formatFeedbackForCopy(feedback: IFeedback, format: 'plain' | 'markdown'): string {
    return format === AI_FORMAT.COPY_FORMATS.MARKDOWN
      ? this.formatAsMarkdown(feedback)
      : this.formatAsPlainText(feedback);
  }

  private formatAsMarkdown(feedback: IFeedback): string {
    return `# AI Evaluation Feedback

## Summary
${feedback.summary}

## Overall Score: ${feedback.overall_score}/10

## ✅ Correct Points
${this.formatListItems(feedback.correct_points, '-')}

## ❌ Points to Review
${this.formatListItems(feedback.incorrect_points, '-')}

## 💡 Improvement Suggestions
${this.formatListItems(feedback.improvement_suggestions, '-')}

## Detailed Analysis
${feedback.detailed_analysis}`;
  }

  private formatAsPlainText(feedback: IFeedback): string {
    return `AI Evaluation Feedback

Summary: ${feedback.summary}

Overall Score: ${feedback.overall_score}/10

Correct Points:
${this.formatListItems(feedback.correct_points, '•')}

Points to Review:
${this.formatListItems(feedback.incorrect_points, '•')}

Improvement Suggestions:
${this.formatListItems(feedback.improvement_suggestions, '•')}

Detailed Analysis:
${feedback.detailed_analysis}`;
  }

  private formatListItems(items: string[], bullet: string): string {
    return items.map((item) => `${bullet} ${item}`).join('\n');
  }

  private async evaluateWithOpenAI(
    model: string,
    prompt: string,
    userId: string,
  ): Promise<ReadableStream<StreamChunk>> {
    return aiUsageTracker.wrapAIOperation(
      {
        user_id: userId,
        command: 'evaluate_note',
        provider: AI_PROVIDERS.OPENAI,
        model: model || AI_DEFAULTS.OPENAI_MODEL,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const openai = new OpenAI({
          apiKey: env.OPENAI_API_KEY,
          baseURL: AI_CONFIG.BASE_URL,
        });

        const stream = await openai.chat.completions.create({
          model: model || AI_DEFAULTS.OPENAI_MODEL,
          messages: [
            {
              role: AI_CHAT_ROLES.SYSTEM,
              content: AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
            },
            {
              role: AI_CHAT_ROLES.USER,
              content: prompt,
            },
          ],
          stream: true,
          temperature: AI_CONFIG.TEMPERATURE,
          max_tokens: AI_CONFIG.MAX_TOKENS,
        });

        return this.createStreamFromOpenAI(stream);
      },
    );
  }

  private async evaluateWithGemini(
    model: string,
    prompt: string,
    userId: string,
  ): Promise<ReadableStream<StreamChunk>> {
    return aiUsageTracker.wrapAIOperation(
      {
        user_id: userId,
        command: 'evaluate_note',
        provider: AI_PROVIDERS.GEMINI,
        model: model || AI_DEFAULTS.GEMINI_MODEL,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const response = await fetch(`${AI_CONFIG.BASE_URL}${AI_API.CHAT_COMPLETIONS_PATH}`, {
          method: HTTP_CONFIG.METHODS.POST,
          headers: {
            'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE,
            Authorization: `${HTTP_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${env.GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            model: model || AI_DEFAULTS.GEMINI_MODEL,
            messages: [
              {
                role: AI_CHAT_ROLES.SYSTEM,
                content: AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
              },
              {
                role: AI_CHAT_ROLES.USER,
                content: prompt,
              },
            ],
            stream: true,
            temperature: AI_CONFIG.TEMPERATURE,
            max_tokens: AI_CONFIG.MAX_TOKENS,
          }),
        });

        if (!response.ok) {
          throw new Error(`${API_ERROR_MESSAGES.GEMINI_REQUEST_FAILED}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error(API_ERROR_MESSAGES.NO_RESPONSE_BODY_GEMINI);
        }

        return this.createStreamFromGemini(response.body);
      },
    );
  }

  private createStreamFromOpenAI(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ): ReadableStream<StreamChunk> {
    return new ReadableStream<StreamChunk>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            controller.enqueue({
              type: CHUNK_TYPES.FEEDBACK,
              content,
              finished: false,
            });
          }

          noteService.handleStreamCompletion(controller, fullContent);
        } catch (error) {
          noteService.handleStreamError(controller, error);
        }
      },
    });
  }

  private createStreamFromGemini(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<StreamChunk> {
    return new ReadableStream<StreamChunk>({
      async start(controller) {
        try {
          let fullContent = '';
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                const data = line.slice(AI_API.SSE_DATA_PREFIX_LENGTH);
                if (data === AI_API.SSE_DONE_MESSAGE) continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || '';
                  fullContent += content;

                  controller.enqueue({
                    type: CHUNK_TYPES.FEEDBACK,
                    content,
                    finished: false,
                  });
                } catch (error) {
                  console.error('Invalid JSON chunk:', data);
                  console.error('Error parsing JSON:', error);
                  // Skip invalid JSON chunks
                }
              }
            }
          }

          noteService.handleStreamCompletion(controller, fullContent);
        } catch (error) {
          noteService.handleStreamError(controller, error);
        }
      },
    });
  }

  private parseFeedbackFromResponse(responseText: string): IFeedback {
    try {
      let cleanedText = responseText.trim();

      if (cleanedText.startsWith(AI_QUIZ_CONFIG.MARKDOWN_JSON_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZ_CONFIG.MARKDOWN_JSON_START}\\s*`),
          '',
        );
      }
      if (cleanedText.startsWith(AI_QUIZ_CONFIG.MARKDOWN_CODE_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZ_CONFIG.MARKDOWN_CODE_START}\\s*`),
          '',
        );
      }
      if (cleanedText.endsWith(AI_QUIZ_CONFIG.MARKDOWN_CODE_END)) {
        cleanedText = cleanedText.replace(
          new RegExp(`\\s*${AI_QUIZ_CONFIG.MARKDOWN_CODE_END}$`),
          '',
        );
      }

      const jsonMatch = cleanedText.match(new RegExp(AI_QUIZ_CONFIG.JSON_REGEX_PATTERN));
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText) as IFeedback;

      if (!parsed.summary || typeof parsed.overall_score !== 'number') {
        throw new Error('Invalid feedback format: missing required fields');
      }

      return {
        summary: parsed.summary || '',
        correct_points: Array.isArray(parsed.correct_points) ? parsed.correct_points : [],
        incorrect_points: Array.isArray(parsed.incorrect_points) ? parsed.incorrect_points : [],
        improvement_suggestions: Array.isArray(parsed.improvement_suggestions)
          ? parsed.improvement_suggestions
          : [],
        overall_score: parsed.overall_score || 0,
        detailed_analysis: parsed.detailed_analysis || '',
      };
    } catch (error) {
      throw new Error(EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE);
    }
  }

  private handleStreamCompletion(controller: StreamController, fullContent: string): void {
    try {
      const feedback = this.parseFeedbackFromResponse(fullContent);
      controller.enqueue({
        type: CHUNK_TYPES.COMPLETE,
        content: JSON.stringify(feedback),
        finished: true,
      });
    } catch {
      controller.enqueue({
        type: CHUNK_TYPES.ERROR,
        content: EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE,
        finished: true,
      });
    } finally {
      controller.close();
    }
  }

  private handleStreamError(controller: StreamController, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;

    controller.enqueue({
      type: CHUNK_TYPES.ERROR,
      content: `${EVALUATION_ERRORS.EVALUATION_FAILED}: ${errorMessage}`,
      finished: true,
    });

    controller.close();
  }
}

export const noteService = new NoteService();
