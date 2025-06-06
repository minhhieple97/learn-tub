'use server';
import { action, ActionError } from '@/lib/safe-action';
import { aiQuizService } from '../services/ai-quiz-service';
import { EvaluateQuizSchema } from '../schemas';

export const evaluateQuizAction = action
  .inputSchema(EvaluateQuizSchema)
  .action(async ({ parsedInput: data }) => {
    const response = await aiQuizService.evaluateQuiz(data);

    if (!response.success) {
      throw new ActionError(response.error || 'Failed to evaluate quiz');
    }

    return {
      success: true,
      feedback: response.feedback,
    };
  });
