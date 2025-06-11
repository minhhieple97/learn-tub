'use server';
import { createClient } from '@/lib/supabase/server';
import { IQuizFilters, QuizDashboardData } from '../types';
import {
  QuizAttempt,
  QuizQuestion,
  QuizSessionWithAttempts,
  IQuizDifficulty,
} from '@/features/quizzes/types';

export const getQuizDashboardData = async (
  userId: string,
  filters?: Partial<IQuizFilters>,
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
      videos!inner(id, title, youtube_id, description),
      quiz_attempts(
        id,
        quiz_session_id,
        user_id,
        answers,
        score,
        correct_answers,
        total_questions,
        completed_at,
        created_at,
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

  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
  }

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

  // Optimize performance by combining all database queries
  const [
    { data: sessions, error },
    { count: totalCount },
    { count: totalSessions },
    { count: totalAttempts },
    { data: avgData },
  ] = await Promise.all([
    query.range(offset, offset + limit - 1),
    countQuery,
    supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase.from('quiz_attempts').select('score').eq('user_id', userId),
  ]);

  if (error) {
    throw new Error(`Failed to fetch quiz sessions: ${error.message}`);
  }

  const averageScore = avgData?.length
    ? Math.round(avgData.reduce((sum, attempt) => sum + attempt.score, 0) / avgData.length)
    : 0;

  const processedSessions: QuizSessionWithAttempts[] = (sessions || []).map((session) => {
    const attempts = session.quiz_attempts || [];
    const latestAttempt = attempts.length > 0 ? attempts[0] : undefined;
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : undefined;

    return {
      ...session,
      difficulty: session.difficulty as IQuizDifficulty,
      attempts,
      latest_attempt: latestAttempt,
      best_score: bestScore,
      attempt_count: attempts.length,
      videos: session.videos
        ? {
            ...session.videos,
            description: session.videos.description || '',
          }
        : undefined,
    };
  });

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

export const getQuizSessionForRetake = async (sessionId: string, userId: string) => {
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
      videos!inner(id, title, youtube_id, description),
      quiz_attempts(
        id,
        quiz_session_id,
        user_id,
        answers,
        score,
        correct_answers,
        total_questions,
        completed_at,
        created_at,
        time_taken_seconds,
        feedback
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
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : undefined;

  return {
    ...session,
    difficulty: session.difficulty as IQuizDifficulty,
    topics: session.topics || [],
    questions: (session.questions as QuizQuestion[]) || [],
    attempts,
    latest_attempt: latestAttempt,
    best_score: bestScore,
    attempt_count: attempts.length,
    videos: session.videos
      ? {
          ...session.videos,
          description: session.videos.description || '',
        }
      : undefined,
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
