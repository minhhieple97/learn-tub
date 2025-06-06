import { createClient } from '@/lib/supabase/server';
import type { QuizSessionWithAttempts, QuizAttempt } from '@/features/ai/types';
import type { QuizDashboardData, QuizFilters } from '../types';

export const getQuizDashboardData = async (
  userId: string,
  filters?: Partial<QuizFilters>,
): Promise<QuizDashboardData> => {
  const supabase = await createClient();
  const limit = filters?.limit || 10;
  const page = filters?.page || 1;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('quiz_sessions')
    .select(
      `
      *,
      videos!inner(id, title, youtube_id),
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

  if (filters?.difficulty && filters.difficulty !== 'all') {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters?.videoId) {
    query = query.eq('video_id', filters.videoId);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
  }

  // Get total count for pagination
  let countQuery = supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (filters?.difficulty && filters.difficulty !== 'all') {
    countQuery = countQuery.eq('difficulty', filters.difficulty);
  }
  if (filters?.search) {
    countQuery = countQuery.ilike('title', `%${filters.search}%`);
  }
  if (filters?.videoId) {
    countQuery = countQuery.eq('video_id', filters.videoId);
  }

  const [{ data: sessions, error }, { count: totalCount }] = await Promise.all([
    query.range(offset, offset + limit - 1),
    countQuery,
  ]);

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

  const totalPages = Math.ceil((totalCount || 0) / limit);

  return {
    sessions: processedSessions,
    totalSessions: totalSessions || 0,
    totalAttempts: totalAttempts || 0,
    averageScore,
    recentAttempts: [],
    totalPages,
    currentPage: page,
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

export const getQuizSessionDetail = async (
  sessionId: string,
  userId: string,
): Promise<QuizSessionWithAttempts | null> => {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select(
      `
      *,
      videos!inner(id, title, youtube_id),
      quiz_attempts(
        id,
        score,
        correct_answers,
        total_questions,
        completed_at,
        time_taken_seconds,
        feedback,
        answers
      )
    `,
    )
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !session) {
    return null;
  }

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
};

export const getUserVideos = async (userId: string) => {
  const supabase = await createClient();

  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, title, youtube_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }

  return videos || [];
};
