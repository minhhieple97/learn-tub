'use server';
import { authAction, ActionError } from '@/lib/safe-action';
import { quizService } from '../services/quiz-service';
import { saveQuizAttempt } from '../queries';
import { getProfileByUserId } from '@/features/profile/queries';
import { z } from 'zod';
import { EvaluateQuizSchema } from '../schema';
import { RateLimiter } from '@/lib/rate-limiter';

const ExtendedEvaluateQuizSchema = EvaluateQuizSchema.extend({
  quizSessionId: z.string().min(1, 'Session ID is required'),
  timeTakenSeconds: z.number().optional(),
});

export const evaluateQuizAction = authAction
  .inputSchema(ExtendedEvaluateQuizSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const rateLimitResult = await RateLimiter.checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      throw new ActionError(
        `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
      );
    }
    const profile = await getProfileByUserId(user.id);

    const response = await quizService.evaluateQuiz({
      ...data,
      userId: profile.id,
    });

    if (!response.success) {
      throw new ActionError(response.error || 'Failed to evaluate quiz');
    }

    const attempt = await saveQuizAttempt({
      quizSessionId: data.quizSessionId,
      userId: profile.id,
      answers: data.answers,
      score: response.data?.score || 0,
      totalQuestions: response.data?.totalQuestions || data.questions.length,
      correctAnswers: response.data?.correctAnswers || 0,
      feedback: response.data,
      timeTakenSeconds: data.timeTakenSeconds,
    });

    return {
      success: true,
      feedback: response.data,
      attemptId: attempt.id,
    };
  });
