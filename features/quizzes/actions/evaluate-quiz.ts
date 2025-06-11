'use server';
import { authAction, ActionError } from '@/lib/safe-action';
import { quizService } from '../services/quiz-service';
import { saveQuizAttempt } from '../queries';
import { getProfileByUserId } from '@/features/profile/queries';
import { z } from 'zod';
import { EvaluateQuizSchema } from '../schema';

const ExtendedEvaluateQuizSchema = EvaluateQuizSchema.extend({
  quizSessionId: z.string().min(1, 'Session ID is required'),
  timeTakenSeconds: z.number().optional(),
});

export const evaluateQuizAction = authAction
  .inputSchema(ExtendedEvaluateQuizSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const profile = await getProfileByUserId(user.id);

    const response = await quizService.evaluateQuiz(data);

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
