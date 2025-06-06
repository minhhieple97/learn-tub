'use server';
import { authAction, ActionError } from '@/lib/safe-action';
import { aiQuizService } from '../services/ai-quiz-service';
import { EvaluateQuizSchema } from '../schemas';
import { saveQuizAttempt } from '../queries/quiz-queries';
import { getProfileByUserId } from '@/features/profile/queries/profile';
import { z } from 'zod';

const ExtendedEvaluateQuizSchema = EvaluateQuizSchema.extend({
  quizSessionId: z.string().min(1, 'Session ID is required'),
  timeTakenSeconds: z.number().optional(),
});

export const evaluateQuizAction = authAction
  .inputSchema(ExtendedEvaluateQuizSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const profile = await getProfileByUserId(user.id);

    const response = await aiQuizService.evaluateQuiz(data);

    if (!response.success) {
      throw new ActionError(response.error || 'Failed to evaluate quiz');
    }

    const attempt = await saveQuizAttempt({
      quizSessionId: data.quizSessionId,
      userId: profile.id,
      answers: data.answers,
      score: response.feedback?.score || 0,
      totalQuestions:
        response.feedback?.totalQuestions || data.questions.length,
      correctAnswers: response.feedback?.correctAnswers || 0,
      feedback: response.feedback,
      timeTakenSeconds: data.timeTakenSeconds,
    });

    return {
      success: true,
      feedback: response.feedback,
      attemptId: attempt.id,
    };
  });
