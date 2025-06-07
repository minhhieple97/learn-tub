import { createClient } from '@/lib/supabase/server';
import type { QuizSessionWithAttempts, QuizAttempt } from '@/features/ai/types';
import type { QuizDashboardData, QuizFilters } from '../types';

export const getQuizDashboardData = async (
  userId: string,
  filters?: Partial<QuizFilters>,
  limit = 20,
  offset = 0,
): Promise<QuizDashboardData> => {
  const supabase = await createClient();

  let query = supabase
    .from('quiz_sessions')
    .select(
      `
      *,
      videos!inner(title, youtube_id),
      quiz_attempts(
        id,
        score,
        correct_answers,
        total_questions,
        completed_at,
        time_taken_seconds,
        feedback
      )
    `,
    )
    .eq('user_id', userId);

  // Apply filters
  if (filters?.difficulty && filters.difficulty !== 'all') {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
  }

  const { data: sessions, error } = await query.range(
    offset,
    offset + limit - 1,
  );

  if (error) {
    throw new Error(`Failed to fetch quiz sessions: ${error.message}`);
  }

  // Get statistics
  const { count: totalSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: totalAttempts } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: avgData } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('user_id', userId);

  const averageScore = avgData?.length
    ? Math.round(
        avgData.reduce((sum, attempt) => sum + attempt.score, 0) /
          avgData.length,
      )
    : 0;

  // Process sessions data
  const processedSessions: QuizSessionWithAttempts[] = sessions.map(
    (session) => {
      const attempts = session.quiz_attempts || [];
      const latestAttempt = attempts.length > 0 ? attempts[0] : undefined;
      const bestScore =
        attempts.length > 0
          ? Math.max(...attempts.map((a: QuizAttempt) => a.score))
          : undefined;

      return {
        ...session,
        attempts,
        latest_attempt: latestAttempt,
        best_score: bestScore,
        attempt_count: attempts.length,
      };
    },
  );

  return {
    sessions: processedSessions,
    totalSessions: totalSessions || 0,
    totalAttempts: totalAttempts || 0,
    averageScore,
    recentAttempts: [], // Will be populated from sessions
  };
};

export const getQuizSessionForRetake = async (
  sessionId: string,
  userId: string,
) => {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch quiz session: ${error.message}`);
  }

  return session;
};
