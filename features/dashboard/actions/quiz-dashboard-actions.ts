'use server';

import { authAction } from '@/lib/safe-action';
import { z } from 'zod';
import {
  getQuizDashboardData,
  getQuizSessionForRetake,
} from '../queries/quiz-dashboard-queries';
import { getProfileByUserId } from '@/features/profile/queries/profile';
import { revalidatePath } from 'next/cache';
import { routes } from '@/routes';

const GetQuizDashboardSchema = z.object({
  filters: z
    .object({
      search: z.string().optional(),
      difficulty: z.enum(['all', 'easy', 'medium', 'hard', 'mixed']).optional(),
      sortBy: z.enum(['created_at', 'score', 'attempts']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

const RetakeQuizSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const getQuizDashboardAction = authAction
  .inputSchema(GetQuizDashboardSchema)
  .action(
    async ({ parsedInput: { filters, limit, offset }, ctx: { user } }) => {
      const profile = await getProfileByUserId(user.id);
      const data = await getQuizDashboardData(
        profile.id,
        filters,
        limit,
        offset,
      );

      return {
        success: true,
        data,
      };
    },
  );

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
