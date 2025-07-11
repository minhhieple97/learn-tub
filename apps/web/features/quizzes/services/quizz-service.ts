import {
  AI_SYSTEM_MESSAGES,
  AI_QUIZZ_CONFIG,
  AI_QUIZZ_ERRORS,
  AI_QUIZZ_PROMPTS,
} from "@/config/constants";
import type {
  IEvaluateQuizRequest,
  IGenerateQuestionsRequest,
  IQuizEvaluationResponse,
  IQuizFeedback,
  IQuizGenerationResponse,
  IQuizQuestion,
} from "../types";
import { aiUsageTracker } from "@/features/ai";
import { AIClientFactory } from "@/features/ai/services/ai-client";
import { createClient } from "@/lib/supabase/server";

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
      const { data: modelData, error } = await supabase
        .from("ai_model_pricing_view")
        .select("model_name")
        .eq("id", aiModelId)
        .single();

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
    videoTitle?: string | null;
    videoDescription?: string | null;
    videoTutorial?: string | null;
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
    videoContext?: {
      title?: string | null;
      description?: string | null;
      tutorial?: string | null;
    },
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
    videoTitle?: string | null;
    videoDescription?: string | null;
    videoTutorial?: string | null;
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

  private async callAIProviderForEvaluation(
    aiModelId: string,
    prompt: string,
    userId: string,
  ): Promise<string> {
    const supabase = await createClient();
    const { data: modelData, error } = await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single();

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
    } catch {
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
}

export const quizService = new QuizzService();
