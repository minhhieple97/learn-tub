'use server';

import { authAction } from '@/lib/safe-action';
import { getQuizSessionForRetake } from '../queries/quiz-dashboard-queries';

import { revalidatePath } from 'next/cache';
import { routes } from '@/routes';
import { RetakeQuizSchema } from '../schemas';
import { checkProfileByUserId } from '@/lib/require-auth';

export const retakeQuizAction = authAction
  .inputSchema(RetakeQuizSchema)
  .action(async ({ parsedInput: { sessionId }, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);
    const session = await getQuizSessionForRetake(sessionId, profile.id);

    revalidatePath(routes.dashboard.quizzes);

    return {
      success: true,
      session,
    };
  });
