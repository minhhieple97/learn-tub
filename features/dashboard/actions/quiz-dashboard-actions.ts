'use server';

import { authAction } from '@/lib/safe-action';
import { z } from 'zod';
import {
  getQuizDashboardData,
  getQuizSessionForRetake,
} from '../queries/quiz-dashboard-queries';
import { getProfileByUserId } from '@/features/profile/queries';
import { revalidatePath } from 'next/cache';
import { routes } from '@/routes';

const RetakeQuizSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const retakeQuizAction = authAction
  .inputSchema(RetakeQuizSchema)
  .action(async ({ parsedInput: { sessionId }, ctx: { user } }) => {
    const profile = await getProfileByUserId(user.id);
    const session = await getQuizSessionForRetake(sessionId, profile.id);

    revalidatePath(routes.dashboard.quizzes);

    return {
      success: true,
      session,
    };
  });
