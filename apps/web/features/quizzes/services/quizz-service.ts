import {
  AI_SYSTEM_MESSAGES,
  AI_QUIZZ_CONFIG,
  AI_QUIZZ_ERRORS,
  AI_QUIZZ_PROMPTS,
  AI_COMMANDS,
} from "@/config/constants";
import type {
  IEvaluateQuizRequest,
  IGenerateQuestionsRequest,
  IQuizEvaluationResponse,
  IQuizFeedback,
  IQuizGenerationResponse,
  IQuizQuestion,
  IQuizStreamChunk,
} from "../types";
import { aiUsageTracker } from "@/features/ai";
import { AIClientFactory } from "@/features/ai/services/ai-client";
import { createClient } from "@/lib/supabase/server";

type IStreamController = ReadableStreamDefaultController<IQuizStreamChunk>;

class QuizzService {
  async generateQuestions(
    request: IGenerateQuestionsRequest,
  ): Promise<IQuizGenerationResponse> {
    try {
      const {
        aiModelId,
        videoTitle,
        videoDescription,
        videoTutorial,
        questionCount = AI_QUIZZ_CONFIG.DEFAULT_QUESTION_COUNT,
        difficulty = AI_QUIZZ_CONFIG.DEFAULT_DIFFICULTY,
        topics,
        userId,
      } = request;
      const prompt = this.createQuestionGenerationPrompt({
        videoTitle,
        videoDescription,
        videoTutorial,
        questionCount,
        difficulty,
        topics,
      });

      const supabase = await createClient();
      const { data: modelData, error } = (await supabase
        .from("ai_model_pricing_view")
        .select("model_name")
        .eq("id", aiModelId)
        .single()) as { data: { model_name: string } | null; error: any };

      if (error || !modelData?.model_name) {
        throw new Error(
          `${AI_QUIZZ_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`,
        );
      }

      const modelName = modelData.model_name;

      const response = await aiUsageTracker.wrapAIOperationWithTokens(
        {
          user_id: userId,
          command: "generate_quizz_questions",
          ai_model_id: aiModelId,
          request_payload: { prompt_length: prompt.length },
        },
        async () => {
          const aiClient = AIClientFactory.getClient();

          const messages = aiClient.createSystemUserMessages(
            AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
            prompt,
          );

          const { result, tokenUsage } = await aiClient.chatCompletionWithUsage(
            {
              model: modelName,
              messages,
            },
          );

          return {
            result,
            tokenUsage,
          };
        },
      );

      const questions = this.parseQuestionsFromResponse(response);

      return {
        success: true,
        data: questions,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : AI_QUIZZ_ERRORS.FAILED_TO_GENERATE,
      };
    }
  }

  async generateQuestionsStream(
    request: IGenerateQuestionsRequest,
  ): Promise<ReadableStream<Uint8Array>> {
    const {
      aiModelId,
      videoTitle,
      videoDescription,
      videoTutorial,
      questionCount = AI_QUIZZ_CONFIG.DEFAULT_QUESTION_COUNT,
      difficulty = AI_QUIZZ_CONFIG.DEFAULT_DIFFICULTY,
      topics,
      userId,
    } = request;

    const prompt = this.createQuestionGenerationPrompt({
      videoTitle,
      videoDescription,
      videoTutorial,
      questionCount,
      difficulty,
      topics,
    });

    return this.callAIProviderStreamForAPI(aiModelId, prompt, userId);
  }

  async evaluateQuiz(
    request: IEvaluateQuizRequest,
  ): Promise<IQuizEvaluationResponse> {
    try {
      const { aiModelId, questions, answers, videoContext, userId } = request;
      const prompt = this.createEvaluationPrompt(
        questions,
        answers,
        videoContext,
      );

      const response = await this.callAIProviderForEvaluation(
        aiModelId,
        prompt,
        userId,
      );
      const feedback = this.parseFeedbackFromResponse(
        response,
        questions,
        answers,
      );

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : AI_QUIZZ_ERRORS.FAILED_TO_EVALUATE,
      };
    }
  }

  private createQuestionGenerationPrompt(params: {
    videoTitle?: string;
    videoDescription?: string;
    videoTutorial?: string;
    questionCount: number;
    difficulty: string;
    topics?: string[];
  }): string {
    const {
      videoTitle,
      videoDescription,
      videoTutorial,
      questionCount,
      difficulty,
      topics,
    } = params;

    const contextInfo = this.buildVideoContext({
      videoTitle,
      videoDescription,
      videoTutorial,
    });
    const topicsInfo = topics?.length
      ? `${AI_QUIZZ_PROMPTS.TOPICS_PREFIX}${topics.join(", ")}`
      : "";
    const difficultyInfo =
      difficulty === AI_QUIZZ_CONFIG.DEFAULT_DIFFICULTY
        ? AI_QUIZZ_PROMPTS.DIFFICULTY_MIXED
        : `${difficulty}${AI_QUIZZ_PROMPTS.DIFFICULTY_SUFFIX}`;

    return `
${AI_QUIZZ_PROMPTS.GENERATION_INTRO.replace("{count}", questionCount.toString())}

${contextInfo}
${topicsInfo}

${AI_QUIZZ_PROMPTS.GENERATION_REQUIREMENTS.replace("{difficulty}", difficultyInfo)}

${AI_QUIZZ_PROMPTS.GENERATION_FORMAT}

${AI_QUIZZ_PROMPTS.GENERATION_FOOTER}`;
  }

  private createEvaluationPrompt(
    questions: IQuizQuestion[],
    answers: Array<{
      questionId: string;
      selectedAnswer: "A" | "B" | "C" | "D";
    }>,
    videoContext?: { title?: string; description?: string; tutorial?: string },
  ): string {
    const contextInfo = this.buildVideoContext({
      videoTitle: videoContext?.title,
      videoDescription: videoContext?.description,
      videoTutorial: videoContext?.tutorial,
    });

    const questionsWithAnswers = questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      return {
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer?.selectedAnswer || "No answer",
        topic: q.topic,
        difficulty: q.difficulty,
      };
    });

    return `
${AI_QUIZZ_PROMPTS.EVALUATION_INTRO}

${contextInfo}

${AI_QUIZZ_PROMPTS.QUIZZ_RESULTS_PREFIX}
${JSON.stringify(questionsWithAnswers, null, 2)}

${AI_QUIZZ_PROMPTS.EVALUATION_FORMAT.replace("{total}", questions.length.toString())}

${AI_QUIZZ_PROMPTS.EVALUATION_FOCUS}`;
  }

  private buildVideoContext(context?: {
    videoTitle?: string;
    videoDescription?: string;
    videoTutorial?: string;
  }): string {
    if (!context) return "";

    const parts: string[] = [];
    if (context.videoTitle) {
      parts.push(
        `${AI_QUIZZ_PROMPTS.VIDEO_TITLE_PREFIX}${context.videoTitle}"`,
      );
    }
    if (context.videoDescription) {
      parts.push(
        `${AI_QUIZZ_PROMPTS.VIDEO_DESCRIPTION_PREFIX}${context.videoDescription}"`,
      );
    }
    if (context.videoTutorial) {
      parts.push(
        `${AI_QUIZZ_PROMPTS.VIDEO_TUTORIAL_PREFIX}${context.videoTutorial}"`,
      );
    }

    return parts.join("\n");
  }

  private async callAIProvider(
    aiModelId: string,
    prompt: string,
    userId: string,
  ): Promise<string> {
    const supabase = await createClient();
    const { data: modelData, error } = (await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single()) as { data: { model_name: string } | null; error: any };

    if (error || !modelData?.model_name) {
      throw new Error(`${AI_QUIZZ_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`);
    }

    const modelName = modelData.model_name;

    return aiUsageTracker.wrapAIOperationWithTokens(
      {
        user_id: userId,
        command: "generate_quizz_questions",
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { result, tokenUsage } = await aiClient.chatCompletionWithUsage({
          model: modelName,
          messages,
        });

        return {
          result,
          tokenUsage,
        };
      },
    );
  }

  private async callAIProviderForEvaluation(
    aiModelId: string,
    prompt: string,
    userId: string,
  ): Promise<string> {
    const supabase = await createClient();
    const { data: modelData, error } = (await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single()) as { data: { model_name: string } | null; error: any };

    if (error || !modelData?.model_name) {
      throw new Error(`${AI_QUIZZ_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`);
    }

    const modelName = modelData.model_name;

    return aiUsageTracker.wrapAIOperationWithTokens(
      {
        user_id: userId,
        command: "evaluate_note",
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { result, tokenUsage } = await aiClient.chatCompletionWithUsage({
          model: modelName,
          messages,
        });

        return {
          result,
          tokenUsage,
        };
      },
    );
  }

  private async callAIProviderStream(
    aiModelId: string,
    prompt: string,
    userId: string,
  ): Promise<ReadableStream<IQuizStreamChunk>> {
    const supabase = await createClient();
    const { data: modelData, error } = (await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single()) as { data: { model_name: string } | null; error: any };

    if (error || !modelData?.model_name) {
      throw new Error(`${AI_QUIZZ_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`);
    }

    const modelName = modelData.model_name;

    return aiUsageTracker.wrapStreamingOperation(
      {
        user_id: userId,
        command: "generate_quizz_questions",
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { stream, getUsage } =
          await aiClient.streamChatCompletionWithUsage({
            model: modelName,
            messages,
            stream_options: {
              include_usage: true,
            },
          });

        const transformedStream = this.createStreamFromAIClient(stream);

        return {
          stream: transformedStream,
          getUsage,
        };
      },
    );
  }

  private async callAIProviderStreamForAPI(
    aiModelId: string,
    prompt: string,
    userId: string,
  ): Promise<ReadableStream<Uint8Array>> {
    const supabase = await createClient();
    const { data: modelData, error } = (await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single()) as { data: { model_name: string } | null; error: any };

    if (error || !modelData?.model_name) {
      throw new Error(`${AI_QUIZZ_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`);
    }

    const modelName = modelData.model_name;

    return aiUsageTracker.wrapStreamingOperation(
      {
        user_id: userId,
        command: "generate_quizz_questions",
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { stream, getUsage } =
          await aiClient.streamChatCompletionWithUsage({
            model: modelName,
            messages,
            stream_options: {
              include_usage: true,
            },
          });

        const transformedStream = this.createAPIStreamFromAIClient(stream);

        return {
          stream: transformedStream,
          getUsage,
        };
      },
    );
  }

  private createStreamFromAIClient(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<IQuizStreamChunk> {
    const aiClient = AIClientFactory.getClient();
    const aiStream = aiClient.createStreamFromResponse(responseBody);

    return new ReadableStream<IQuizStreamChunk>({
      async start(controller) {
        try {
          let fullContent = "";
          const reader = aiStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const content = value.choices[0]?.delta?.content || "";
            fullContent += content;

            controller.enqueue({
              type: "question",
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

  private createAPIStreamFromAIClient(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const aiClient = AIClientFactory.getClient();
    const aiStream = aiClient.createStreamFromResponse(responseBody);

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let fullContent = "";
          const reader = aiStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const content = value.choices[0]?.delta?.content || "";
            fullContent += content;

            const chunkData =
              JSON.stringify({
                type: "question",
                content,
                finished: false,
              }) + "\n";

            controller.enqueue(encoder.encode(chunkData));
          }

          try {
            const questions =
              quizService.parseQuestionsFromResponse(fullContent);
            const completeData =
              JSON.stringify({
                type: "complete",
                content: JSON.stringify(questions),
                finished: true,
              }) + "\n";

            controller.enqueue(encoder.encode(completeData));
          } catch {
            const errorData =
              JSON.stringify({
                type: "error",
                content: AI_QUIZZ_ERRORS.FAILED_TO_PARSE_QUESTIONS,
                finished: true,
              }) + "\n";

            controller.enqueue(encoder.encode(errorData));
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : AI_QUIZZ_ERRORS.FAILED_TO_GENERATE;
          const errorData =
            JSON.stringify({
              type: "error",
              content: `${AI_QUIZZ_ERRORS.FAILED_TO_GENERATE}: ${errorMessage}`,
              finished: true,
            }) + "\n";

          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      },
    });
  }

  private parseQuestionsFromResponse(responseText: string): IQuizQuestion[] {
    try {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_JSON_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_JSON_START}\\s*`),
          "",
        );
      }
      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_CODE_START}\\s*`),
          "",
        );
      }
      if (cleanedText.endsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_END)) {
        cleanedText = cleanedText.replace(
          new RegExp(`\\s*${AI_QUIZZ_CONFIG.MARKDOWN_CODE_END}$`),
          "",
        );
      }
      const jsonMatch = cleanedText.match(
        new RegExp(AI_QUIZZ_CONFIG.JSON_REGEX_PATTERN),
      );
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      const parsed = JSON.parse(cleanedText);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error(AI_QUIZZ_ERRORS.INVALID_RESPONSE_FORMAT);
      }

      return parsed.questions.map(
        (q: Record<string, unknown>, index: number) => {
          const options = q.options as Record<string, string> | undefined;
          return {
            id:
              (q.id as string) ||
              `${AI_QUIZZ_CONFIG.DEFAULT_QUESTION_ID_PREFIX}${index + 1}`,
            question: (q.question as string) || "",
            options: {
              A: options?.A || "",
              B: options?.B || "",
              C: options?.C || "",
              D: options?.D || "",
            },
            correctAnswer:
              (q.correctAnswer as "A" | "B" | "C" | "D") ||
              AI_QUIZZ_CONFIG.DEFAULT_ANSWER,
            explanation: (q.explanation as string) || "",
            topic: (q.topic as string) || AI_QUIZZ_CONFIG.DEFAULT_TOPIC,
            difficulty:
              (q.difficulty as "easy" | "medium" | "hard") ||
              AI_QUIZZ_CONFIG.DEFAULT_QUIZZ_DIFFICULTY,
          };
        },
      );
    } catch (_error) {
      console.error("Failed to parse AI response:", _error);
      console.error("Original response text:", responseText);
      throw new Error(AI_QUIZZ_ERRORS.FAILED_TO_PARSE_QUESTIONS);
    }
  }

  private parseFeedbackFromResponse(
    responseText: string,
    questions: IQuizQuestion[],
    answers: Array<{
      questionId: string;
      selectedAnswer: "A" | "B" | "C" | "D";
    }>,
  ): IQuizFeedback {
    try {
      let cleanedText = responseText.trim();

      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_JSON_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_JSON_START}\\s*`),
          "",
        );
      }
      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_CODE_START}\\s*`),
          "",
        );
      }
      if (cleanedText.endsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_END)) {
        cleanedText = cleanedText.replace(
          new RegExp(`\\s*${AI_QUIZZ_CONFIG.MARKDOWN_CODE_END}$`),
          "",
        );
      }

      const jsonMatch = cleanedText.match(
        new RegExp(AI_QUIZZ_CONFIG.JSON_REGEX_PATTERN),
      );
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText);

      // Calculate results for each question
      const results = questions.map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        const selectedAnswer =
          userAnswer?.selectedAnswer || AI_QUIZZ_CONFIG.DEFAULT_ANSWER;
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
        correctAnswers:
          parsed.correctAnswers || results.filter((r) => r.isCorrect).length,
        score:
          parsed.score ||
          Math.round(
            (results.filter((r) => r.isCorrect).length / questions.length) *
              100,
          ),
        results,
        overallFeedback:
          parsed.overallFeedback || AI_QUIZZ_ERRORS.QUIZZ_COMPLETED_SUCCESS,
        areasForImprovement: parsed.areasForImprovement || [],
        strengths: parsed.strengths || [],
        performanceByTopic: parsed.performanceByTopic || {},
      };
    } catch (_error) {
      const results = questions.map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        const selectedAnswer =
          userAnswer?.selectedAnswer || AI_QUIZZ_CONFIG.DEFAULT_ANSWER;
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
        overallFeedback: AI_QUIZZ_ERRORS.QUIZZ_COMPLETED_FALLBACK,
        areasForImprovement: [],
        strengths: [],
        performanceByTopic: {},
      };
    }
  }

  private handleStreamCompletion(
    controller: IStreamController,
    fullContent: string,
  ): void {
    try {
      const questions = this.parseQuestionsFromResponse(fullContent);
      controller.enqueue({
        type: "complete",
        content: JSON.stringify(questions),
        finished: true,
      });
    } catch {
      controller.enqueue({
        type: "error",
        content: AI_QUIZZ_ERRORS.FAILED_TO_PARSE_QUESTIONS,
        finished: true,
      });
    } finally {
      controller.close();
    }
  }

  private handleStreamError(
    controller: IStreamController,
    error: unknown,
  ): void {
    const errorMessage =
      error instanceof Error
        ? error.message
        : AI_QUIZZ_ERRORS.FAILED_TO_GENERATE;

    controller.enqueue({
      type: "error",
      content: `${AI_QUIZZ_ERRORS.FAILED_TO_GENERATE}: ${errorMessage}`,
      finished: true,
    });

    controller.close();
  }

  async generateQuizQuestionsStream(
    prompt: string,
    userId: string,
    aiModelId: string,
  ): Promise<ReadableStream<IQuizStreamChunk>> {
    return this.callAIProviderStream(aiModelId, prompt, userId);
  }

  async generateQuizQuestionsStreamForAPI(
    prompt: string,
    userId: string,
    aiModelId: string,
  ): Promise<ReadableStream<Uint8Array>> {
    return this.callAIProviderStreamForAPI(aiModelId, prompt, userId);
  }
}

export const quizService = new QuizzService();
