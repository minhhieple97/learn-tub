import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
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
} from '@/config/constants';
import { INoteEvaluationRequest } from '@/features/notes/types';
import { IFeedback, StreamChunk } from '@/types';

type StreamController = ReadableStreamDefaultController<StreamChunk>;
type ProviderEvaluator = (model: string, prompt: string) => Promise<ReadableStream<StreamChunk>>;

class NoteService {
  async evaluateNote(request: INoteEvaluationRequest): Promise<ReadableStream<StreamChunk>> {
    const { provider, model, content, context } = request;
    const prompt = this.createEvaluationPrompt(content, context);

    const evaluator = this.getProviderEvaluator(provider);
    return evaluator(model, prompt);
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
  ): Promise<ReadableStream<StreamChunk>> {
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
  }

  private async evaluateWithGemini(
    model: string,
    prompt: string,
  ): Promise<ReadableStream<StreamChunk>> {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const response = await genAI.models.generateContentStream({
      model: model || AI_DEFAULTS.GEMINI_MODEL,
      contents: prompt,
    });

    return this.createStreamFromGemini(response);
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
    response: AsyncIterable<{ text?: string }>,
  ): ReadableStream<StreamChunk> {
    return new ReadableStream<StreamChunk>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of response) {
            const content = chunk.text || '';
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

  private handleStreamCompletion(controller: StreamController, fullContent: string): void {
    try {
      const feedback = JSON.parse(fullContent) as IFeedback;
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
