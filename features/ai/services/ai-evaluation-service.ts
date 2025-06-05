import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/env.mjs';
import {
  AI_CONFIG,
  AI_DEFAULTS,
  AI_PROVIDERS,
  AI_CHUNK_TYPES,
  AI_CHAT_ROLES,
  AI_SYSTEM_MESSAGES,
  AI_EVALUATION_ERRORS,
  AI_FORMAT,
  AI_ERROR_MESSAGES,
} from '@/config/constants';
import type { AIProvider, AIFeedback, AIEvaluationRequest, AIStreamChunk } from '../types';

export const aiEvaluationService = {
  async evaluateNote(request: AIEvaluationRequest): Promise<ReadableStream<AIStreamChunk>> {
    const { provider, model, content, context } = request;

    const prompt = this.createEvaluationPrompt(content, context);

    if (provider === AI_PROVIDERS.OPENAI) {
      return this.evaluateWithOpenAI(model, prompt);
    } else if (provider === AI_PROVIDERS.GEMINI) {
      return this.evaluateWithGemini(model, prompt);
    } else {
      throw new Error(`${AI_EVALUATION_ERRORS.UNSUPPORTED_PROVIDER}: ${provider}`);
    }
  },

  createEvaluationPrompt(content: string, context?: AIEvaluationRequest['context']): string {
    const basePrompt = `
Please evaluate the following learning note and provide detailed feedback:

Note Content: "${content}"
${context?.videoTitle ? `Video Title: "${context.videoTitle}"` : ''}
${context?.videoDescription ? `Video Context: "${context.videoDescription}"` : ''}
${context?.timestamp ? `Timestamp: ${this.formatTimestamp(context.timestamp)}` : ''}

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

    return basePrompt;
  },

  formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes
        .toString()
        .padStart(AI_FORMAT.TIMESTAMP_PADDING, AI_FORMAT.TIMESTAMP_PAD_CHAR)}:${secs
        .toString()
        .padStart(AI_FORMAT.TIMESTAMP_PADDING, AI_FORMAT.TIMESTAMP_PAD_CHAR)}`;
    }

    return `${minutes}:${secs
      .toString()
      .padStart(AI_FORMAT.TIMESTAMP_PADDING, AI_FORMAT.TIMESTAMP_PAD_CHAR)}`;
  },

  formatFeedbackForCopy(feedback: AIFeedback, format: 'plain' | 'markdown'): string {
    if (format === AI_FORMAT.COPY_FORMATS.MARKDOWN) {
      return `# AI Evaluation Feedback

## Summary
${feedback.summary}

## Overall Score: ${feedback.overall_score}/10

## ✅ Correct Points
${feedback.correct_points.map((point) => `- ${point}`).join('\n')}

## ❌ Points to Review
${feedback.incorrect_points.map((point) => `- ${point}`).join('\n')}

## 💡 Improvement Suggestions
${feedback.improvement_suggestions.map((suggestion) => `- ${suggestion}`).join('\n')}

## Detailed Analysis
${feedback.detailed_analysis}`;
    }

    return `AI Evaluation Feedback

Summary: ${feedback.summary}

Overall Score: ${feedback.overall_score}/10

Correct Points:
${feedback.correct_points.map((point) => `• ${point}`).join('\n')}

Points to Review:
${feedback.incorrect_points.map((point) => `• ${point}`).join('\n')}

Improvement Suggestions:
${feedback.improvement_suggestions.map((suggestion) => `• ${suggestion}`).join('\n')}

Detailed Analysis:
${feedback.detailed_analysis}`;
  },

  async evaluateWithOpenAI(model: string, prompt: string): Promise<ReadableStream<AIStreamChunk>> {
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

    return new ReadableStream<AIStreamChunk>({
      async start(controller) {
        let fullContent = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            controller.enqueue({
              type: AI_CHUNK_TYPES.FEEDBACK,
              content,
              finished: false,
            });
          }

          try {
            const feedback = JSON.parse(fullContent) as AIFeedback;
            controller.enqueue({
              type: AI_CHUNK_TYPES.COMPLETE,
              content: JSON.stringify(feedback),
              finished: true,
            });
          } catch (parseError) {
            controller.enqueue({
              type: AI_CHUNK_TYPES.ERROR,
              content: AI_EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE,
              finished: true,
            });
          }
        } catch (error) {
          controller.enqueue({
            type: AI_CHUNK_TYPES.ERROR,
            content: `${AI_EVALUATION_ERRORS.EVALUATION_FAILED}: ${
              error instanceof Error ? error.message : AI_ERROR_MESSAGES.UNKNOWN_ERROR
            }`,
            finished: true,
          });
        } finally {
          controller.close();
        }
      },
    });
  },

  async evaluateWithGemini(model: string, prompt: string): Promise<ReadableStream<AIStreamChunk>> {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    return new ReadableStream<AIStreamChunk>({
      async start(controller) {
        try {
          const response = await genAI.models.generateContentStream({
            model: model || AI_DEFAULTS.GEMINI_MODEL,
            contents: prompt,
          });

          let fullContent = '';

          for await (const chunk of response) {
            const content = chunk.text || '';
            fullContent += content;

            controller.enqueue({
              type: AI_CHUNK_TYPES.FEEDBACK,
              content,
              finished: false,
            });
          }

          try {
            const feedback = JSON.parse(fullContent) as AIFeedback;
            controller.enqueue({
              type: AI_CHUNK_TYPES.COMPLETE,
              content: JSON.stringify(feedback),
              finished: true,
            });
          } catch (parseError) {
            controller.enqueue({
              type: AI_CHUNK_TYPES.ERROR,
              content: AI_EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE,
              finished: true,
            });
          }
        } catch (error) {
          controller.enqueue({
            type: AI_CHUNK_TYPES.ERROR,
            content: `${AI_EVALUATION_ERRORS.EVALUATION_FAILED}: ${
              error instanceof Error ? error.message : AI_ERROR_MESSAGES.UNKNOWN_ERROR
            }`,
            finished: true,
          });
        } finally {
          controller.close();
        }
      },
    });
  },
};
