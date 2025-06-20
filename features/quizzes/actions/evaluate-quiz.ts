'use server';
import { authAction, ActionError } from '@/lib/safe-action';
import { quizService } from '../services/quizz-service';
import { saveQuizAttempt } from '../queries';
import { z } from 'zod';
import { EvaluateQuizSchema } from '../schema';
import { RateLimiter } from '@/lib/rate-limiter';
import { checkProfileByUserId } from '@/lib/require-auth';
import { deductCredits } from '@/features/payments/services/deduction-credit';
import { AI_COMMANDS } from '@/config/constants';

export const evaluateQuizAction = authAction
  .inputSchema(EvaluateQuizSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const rateLimitResult = await RateLimiter.checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      throw new ActionError(
        `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
      );
    }

    const profile = await checkProfileByUserId(user.id);

    const response = await quizService.evaluateQuiz({
      questions: data.questions,
      answers: data.answers,
      videoContext: data.videoContext,
      aiModelId: data.aiModelId,
      userId: profile.id,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to evaluate quiz');
    }

    const attempt = await saveQuizAttempt({
      quizSessionId: data.quizSessionId,
      userId: profile.id,
      answers: data.answers,
      score: response.data.score,
      totalQuestions: response.data.totalQuestions,
      correctAnswers: response.data.correctAnswers,
      feedback: response.data,
      timeTakenSeconds: data.timeTakenSeconds,
    });

    const creditResult = await deductCredits({
      userId: profile.id,
      command: AI_COMMANDS.EVALUATE_QUIZZ_ANSWERS,
      description: `Quiz evaluation for session: ${data.quizSessionId}`,
      relatedActionId: attempt.id,
    });

    if (!creditResult.success) {
      console.error('Failed to deduct credits after quiz evaluation:', creditResult.error);
    }

    return {
      success: true,
      feedback: response.data,
      attemptId: attempt.id,
    };
  });
