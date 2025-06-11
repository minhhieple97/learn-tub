import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/env.mjs';
import {
  AI_CONFIG,
  AI_DEFAULTS,
  AI_PROVIDERS,
  AI_CHAT_ROLES,
  AI_SYSTEM_MESSAGES,
  AI_QUIZ_CONFIG,
  AI_QUIZ_ERRORS,
  AI_QUIZ_PROMPTS,
} from '@/config/constants';
import type {
  IEvaluateQuizRequest,
  IGenerateQuestionsRequest,
  IQuizEvaluationResponse,
  IQuizFeedback,
  IQuizGenerationResponse,
  IQuizQuestion,
  IQuizStreamChunk,
} from '../types';

type StreamController = ReadableStreamDefaultController<IQuizStreamChunk>;

class QuizService {
  async generateQuestions(request: IGenerateQuestionsRequest): Promise<IQuizGenerationResponse> {
    try {
      const {
        provider,
        model,
        videoTitle,
        videoDescription,
        questionCount = AI_QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
        difficulty = AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY,
        topics,
      } = request;
      const prompt = this.createQuestionGenerationPrompt({
        videoTitle,
        videoDescription,
        questionCount,
        difficulty,
        topics,
      });

      const response = await this.callAIProvider(provider, model, prompt);
      const questions = this.parseQuestionsFromResponse(response);

      return {
        success: true,
        questions,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : AI_QUIZ_ERRORS.FAILED_TO_GENERATE,
      };
    }
  }

  async generateQuestionsStream(
    request: IGenerateQuestionsRequest,
  ): Promise<ReadableStream<Uint8Array>> {
    const {
      provider,
      model,
      videoTitle,
      videoDescription,
      questionCount = AI_QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
      difficulty = AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY,
      topics,
    } = request;

    const prompt = this.createQuestionGenerationPrompt({
      videoTitle,
      videoDescription,
      questionCount,
      difficulty,
      topics,
    });

    return this.callAIProviderStreamForAPI(provider, model, prompt);
  }

  async evaluateQuiz(request: IEvaluateQuizRequest): Promise<IQuizEvaluationResponse> {
    try {
      const { provider, model, questions, answers, videoContext } = request;
      const prompt = this.createEvaluationPrompt(questions, answers, videoContext);

      const response = await this.callAIProvider(provider, model, prompt);
      const feedback = this.parseFeedbackFromResponse(response, questions, answers);

      return {
        success: true,
        feedback,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : AI_QUIZ_ERRORS.FAILED_TO_EVALUATE,
      };
    }
  }

  private createQuestionGenerationPrompt(params: {
    videoTitle?: string;
    videoDescription?: string;
    questionCount: number;
    difficulty: string;
    topics?: string[];
  }): string {
    const { videoTitle, videoDescription, questionCount, difficulty, topics } = params;

    const contextInfo = this.buildVideoContext({ videoTitle, videoDescription });
    const topicsInfo = topics?.length ? `${AI_QUIZ_PROMPTS.TOPICS_PREFIX}${topics.join(', ')}` : '';
    const difficultyInfo =
      difficulty === AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY
        ? AI_QUIZ_PROMPTS.DIFFICULTY_MIXED
        : `${difficulty}${AI_QUIZ_PROMPTS.DIFFICULTY_SUFFIX}`;

    return `
${AI_QUIZ_PROMPTS.GENERATION_INTRO.replace('{count}', questionCount.toString())}

${contextInfo}
${topicsInfo}

${AI_QUIZ_PROMPTS.GENERATION_REQUIREMENTS.replace('{difficulty}', difficultyInfo)}

${AI_QUIZ_PROMPTS.GENERATION_FORMAT}

${AI_QUIZ_PROMPTS.GENERATION_FOOTER}`;
  }

  private createEvaluationPrompt(
    questions: IQuizQuestion[],
    answers: Array<{ questionId: string; selectedAnswer: 'A' | 'B' | 'C' | 'D' }>,
    videoContext?: { title?: string; description?: string },
  ): string {
    const contextInfo = this.buildVideoContext({
      videoTitle: videoContext?.title,
      videoDescription: videoContext?.description,
    });

    const questionsWithAnswers = questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      return {
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer?.selectedAnswer || 'No answer',
        topic: q.topic,
        difficulty: q.difficulty,
      };
    });

    return `
${AI_QUIZ_PROMPTS.EVALUATION_INTRO}

${contextInfo}

${AI_QUIZ_PROMPTS.QUIZ_RESULTS_PREFIX}
${JSON.stringify(questionsWithAnswers, null, 2)}

${AI_QUIZ_PROMPTS.EVALUATION_FORMAT.replace('{total}', questions.length.toString())}

${AI_QUIZ_PROMPTS.EVALUATION_FOCUS}`;
  }

  private buildVideoContext(context?: { videoTitle?: string; videoDescription?: string }): string {
    if (!context) return '';

    const parts: string[] = [];
    if (context.videoTitle) {
      parts.push(`${AI_QUIZ_PROMPTS.VIDEO_TITLE_PREFIX}${context.videoTitle}"`);
    }
    if (context.videoDescription) {
      parts.push(`${AI_QUIZ_PROMPTS.VIDEO_DESCRIPTION_PREFIX}${context.videoDescription}"`);
    }

    return parts.join('\n');
  }

  private async callAIProvider(provider: string, model: string, prompt: string): Promise<string> {
    if (provider === AI_PROVIDERS.OPENAI) {
      return this.callOpenAI(model, prompt);
    } else if (provider === AI_PROVIDERS.GEMINI) {
      return this.callGemini(model, prompt);
    } else {
      throw new Error(`${AI_QUIZ_ERRORS.UNSUPPORTED_PROVIDER}: ${provider}`);
    }
  }

  private async callAIProviderStream(
    provider: string,
    model: string,
    prompt: string,
  ): Promise<ReadableStream<IQuizStreamChunk>> {
    if (provider === AI_PROVIDERS.OPENAI) {
      return this.callOpenAIStream(model, prompt);
    } else if (provider === AI_PROVIDERS.GEMINI) {
      return this.callGeminiStream(model, prompt);
    } else {
      throw new Error(`${AI_QUIZ_ERRORS.UNSUPPORTED_PROVIDER}: ${provider}`);
    }
  }

  private async callAIProviderStreamForAPI(
    provider: string,
    model: string,
    prompt: string,
  ): Promise<ReadableStream<Uint8Array>> {
    if (provider === AI_PROVIDERS.OPENAI) {
      return this.callOpenAIStreamForAPI(model, prompt);
    } else if (provider === AI_PROVIDERS.GEMINI) {
      return this.callGeminiStreamForAPI(model, prompt);
    } else {
      throw new Error(`${AI_QUIZ_ERRORS.UNSUPPORTED_PROVIDER}: ${provider}`);
    }
  }

  private async callOpenAI(model: string, prompt: string): Promise<string> {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: AI_CONFIG.BASE_URL,
    });

    const response = await openai.chat.completions.create({
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
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async callGemini(model: string, prompt: string): Promise<string> {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const response = await genAI.models.generateContent({
      model: model || AI_DEFAULTS.GEMINI_MODEL,
      contents: prompt,
    });

    return response.text || '';
  }

  private async callOpenAIStream(
    model: string,
    prompt: string,
  ): Promise<ReadableStream<IQuizStreamChunk>> {
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

  private async callGeminiStream(
    model: string,
    prompt: string,
  ): Promise<ReadableStream<IQuizStreamChunk>> {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const response = await genAI.models.generateContentStream({
      model: model || AI_DEFAULTS.GEMINI_MODEL,
      contents: prompt,
    });

    return this.createStreamFromGemini(response);
  }

  private async callOpenAIStreamForAPI(
    model: string,
    prompt: string,
  ): Promise<ReadableStream<Uint8Array>> {
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

    return this.createAPIStreamFromOpenAI(stream);
  }

  private async callGeminiStreamForAPI(
    model: string,
    prompt: string,
  ): Promise<ReadableStream<Uint8Array>> {
    const genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const response = await genAI.models.generateContentStream({
      model: model || AI_DEFAULTS.GEMINI_MODEL,
      contents: prompt,
    });

    return this.createAPIStreamFromGemini(response);
  }

  private parseQuestionsFromResponse(responseText: string): IQuizQuestion[] {
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
      const parsed = JSON.parse(cleanedText);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error(AI_QUIZ_ERRORS.INVALID_RESPONSE_FORMAT);
      }

      return parsed.questions.map((q: Record<string, unknown>, index: number) => {
        const options = q.options as Record<string, string> | undefined;
        return {
          id: (q.id as string) || `${AI_QUIZ_CONFIG.DEFAULT_QUESTION_ID_PREFIX}${index + 1}`,
          question: (q.question as string) || '',
          options: {
            A: options?.A || '',
            B: options?.B || '',
            C: options?.C || '',
            D: options?.D || '',
          },
          correctAnswer:
            (q.correctAnswer as 'A' | 'B' | 'C' | 'D') || AI_QUIZ_CONFIG.DEFAULT_ANSWER,
          explanation: (q.explanation as string) || '',
          topic: (q.topic as string) || AI_QUIZ_CONFIG.DEFAULT_TOPIC,
          difficulty:
            (q.difficulty as 'easy' | 'medium' | 'hard') || AI_QUIZ_CONFIG.DEFAULT_QUIZ_DIFFICULTY,
        };
      });
    } catch (_error) {
      console.error('Failed to parse AI response:', _error);
      console.error('Original response text:', responseText);
      throw new Error(AI_QUIZ_ERRORS.FAILED_TO_PARSE_QUESTIONS);
    }
  }

  private parseFeedbackFromResponse(
    responseText: string,
    questions: IQuizQuestion[],
    answers: Array<{ questionId: string; selectedAnswer: 'A' | 'B' | 'C' | 'D' }>,
  ): IQuizFeedback {
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

      const parsed = JSON.parse(cleanedText);

      // Calculate results for each question
      const results = questions.map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        const selectedAnswer = userAnswer?.selectedAnswer || AI_QUIZ_CONFIG.DEFAULT_ANSWER;
        const isCorrect = selectedAnswer === question.correctAnswer;

        return {
          questionId: question.id,
          question: question.question,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation,
          topic: question.topic,
          difficulty: question.difficulty,
        };
      });

      return {
        totalQuestions: parsed.totalQuestions || questions.length,
        correctAnswers: parsed.correctAnswers || results.filter((r) => r.isCorrect).length,
        score:
          parsed.score ||
          Math.round((results.filter((r) => r.isCorrect).length / questions.length) * 100),
        results,
        overallFeedback: parsed.overallFeedback || AI_QUIZ_ERRORS.QUIZ_COMPLETED_SUCCESS,
        areasForImprovement: parsed.areasForImprovement || [],
        strengths: parsed.strengths || [],
        performanceByTopic: parsed.performanceByTopic || {},
      };
    } catch (_error) {
      const results = questions.map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        const selectedAnswer = userAnswer?.selectedAnswer || AI_QUIZ_CONFIG.DEFAULT_ANSWER;
        const isCorrect = selectedAnswer === question.correctAnswer;

        return {
          questionId: question.id,
          question: question.question,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation,
          topic: question.topic,
          difficulty: question.difficulty,
        };
      });

      const correctCount = results.filter((r) => r.isCorrect).length;

      return {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score: Math.round((correctCount / questions.length) * 100),
        results,
        overallFeedback: AI_QUIZ_ERRORS.QUIZ_COMPLETED_FALLBACK,
        areasForImprovement: [],
        strengths: [],
        performanceByTopic: {},
      };
    }
  }

  private createStreamFromOpenAI(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ): ReadableStream<IQuizStreamChunk> {
    return new ReadableStream<IQuizStreamChunk>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            controller.enqueue({
              type: 'question',
              content,
              finished: false,
            });
          }

          quizService.handleStreamCompletion(controller, fullContent);
        } catch (error) {
          quizService.handleStreamError(controller, error);
        }
      },
    });
  }

  private createStreamFromGemini(
    response: AsyncIterable<{ text?: string }>,
  ): ReadableStream<IQuizStreamChunk> {
    return new ReadableStream<IQuizStreamChunk>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of response) {
            const content = chunk.text || '';
            fullContent += content;

            controller.enqueue({
              type: 'question',
              content,
              finished: false,
            });
          }

          quizService.handleStreamCompletion(controller, fullContent);
        } catch (error) {
          quizService.handleStreamError(controller, error);
        }
      },
    });
  }

  private handleStreamCompletion(controller: StreamController, fullContent: string): void {
    try {
      const questions = this.parseQuestionsFromResponse(fullContent);
      controller.enqueue({
        type: 'complete',
        content: JSON.stringify(questions),
        finished: true,
      });
    } catch {
      controller.enqueue({
        type: 'error',
        content: AI_QUIZ_ERRORS.FAILED_TO_PARSE_QUESTIONS,
        finished: true,
      });
    } finally {
      controller.close();
    }
  }

  private handleStreamError(controller: StreamController, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : AI_QUIZ_ERRORS.FAILED_TO_GENERATE;

    controller.enqueue({
      type: 'error',
      content: `${AI_QUIZ_ERRORS.FAILED_TO_GENERATE}: ${errorMessage}`,
      finished: true,
    });

    controller.close();
  }

  private createAPIStreamFromOpenAI(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            const chunkData =
              JSON.stringify({
                type: 'question',
                content,
                finished: false,
              }) + '\n';

            controller.enqueue(encoder.encode(chunkData));
          }

          try {
            const questions = quizService.parseQuestionsFromResponse(fullContent);
            const completeData =
              JSON.stringify({
                type: 'complete',
                content: JSON.stringify(questions),
                finished: true,
              }) + '\n';

            controller.enqueue(encoder.encode(completeData));
          } catch {
            const errorData =
              JSON.stringify({
                type: 'error',
                content: AI_QUIZ_ERRORS.FAILED_TO_PARSE_QUESTIONS,
                finished: true,
              }) + '\n';

            controller.enqueue(encoder.encode(errorData));
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : AI_QUIZ_ERRORS.FAILED_TO_GENERATE;
          const errorData =
            JSON.stringify({
              type: 'error',
              content: `${AI_QUIZ_ERRORS.FAILED_TO_GENERATE}: ${errorMessage}`,
              finished: true,
            }) + '\n';

          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      },
    });
  }

  private createAPIStreamFromGemini(
    response: AsyncIterable<{ text?: string }>,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of response) {
            const content = chunk.text || '';
            fullContent += content;

            const chunkData =
              JSON.stringify({
                type: 'question',
                content,
                finished: false,
              }) + '\n';

            controller.enqueue(encoder.encode(chunkData));
          }

          try {
            const questions = quizService.parseQuestionsFromResponse(fullContent);
            const completeData =
              JSON.stringify({
                type: 'complete',
                content: JSON.stringify(questions),
                finished: true,
              }) + '\n';

            controller.enqueue(encoder.encode(completeData));
          } catch {
            const errorData =
              JSON.stringify({
                type: 'error',
                content: AI_QUIZ_ERRORS.FAILED_TO_PARSE_QUESTIONS,
                finished: true,
              }) + '\n';

            controller.enqueue(encoder.encode(errorData));
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : AI_QUIZ_ERRORS.FAILED_TO_GENERATE;
          const errorData =
            JSON.stringify({
              type: 'error',
              content: `${AI_QUIZ_ERRORS.FAILED_TO_GENERATE}: ${errorMessage}`,
              finished: true,
            }) + '\n';

          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      },
    });
  }
}

export const quizService = new QuizService();
