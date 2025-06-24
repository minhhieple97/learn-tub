import { createClient } from '@/lib/supabase/server';
import {
  IDatabaseQuizSession,
  IQuizAttempt,
  IQuizDifficulty,
  IQuizFeedback,
  IUserAnswer,
} from '../types';
import { IQuizQuestion } from '../types';
import { IQuizSession, IQuizSessionWithAttempts } from '../types';
import type { Database } from '@/database.types';

export const createQuizSession = async (data: {
  userId: string;
  videoId: string;
  title: string;
  difficulty: IQuizDifficulty;
  questionCount: number;
  topics?: string[];
  aiModelId: string;
  questions: IQuizQuestion[];
}): Promise<Database['public']['Tables']['quiz_sessions']['Row']> => {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: data.userId,
      video_id: data.videoId,
      title: data.title,
      difficulty: data.difficulty,
      question_count: data.questionCount,
      topics: data.topics || [],
      ai_model_id: data.aiModelId,
      questions: data.questions,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create quiz session: ${error.message}`);
  }

  return session;
};

export const saveQuizAttempt = async (data: {
  quizSessionId: string;
  userId: string;
  answers: IUserAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  feedback?: IQuizFeedback;
  timeTakenSeconds?: number;
}): Promise<IQuizAttempt> => {
  const supabase = await createClient();

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_session_id: data.quizSessionId,
      user_id: data.userId,
      answers: data.answers,
      score: data.score,
      total_questions: data.totalQuestions,
      correct_answers: data.correctAnswers,
      feedback: data.feedback,
      time_taken_seconds: data.timeTakenSeconds,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save quiz attempt: ${error.message}`);
  }

  return attempt;
};

export const getUserQuizSessions = async (
  userId: string,
  limit = 10,
  offset = 0,
): Promise<IQuizSessionWithAttempts[]> => {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select(
      `
      *,
      videos!inner(title, youtube_id, description),
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
      ),
      ai_model_pricing!inner(
        model_name,
        provider:ai_providers!inner(
          name,
          display_name
        )
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch quiz sessions: ${error.message}`);
  }

  return sessions.map((session) => {
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
      model_name: session.ai_model_pricing?.model_name,
      provider_name: session.ai_model_pricing?.provider?.name,
      provider_display_name: session.ai_model_pricing?.provider?.display_name,
    };
  });
};

export const getVideoQuizSessions = async (
  videoId: string,
  userId: string,
): Promise<IQuizSessionWithAttempts[]> => {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select(
      `
      *,
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
      ),
      ai_model_pricing!inner(
        model_name,
        provider:ai_providers!inner(
          name,
          display_name
        )
      )
    `,
    )
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch video quiz sessions: ${error.message}`);
  }

  return sessions.map((session) => {
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
      model_name: session.ai_model_pricing?.model_name,
      provider_name: session.ai_model_pricing?.provider?.name,
      provider_display_name: session.ai_model_pricing?.provider?.display_name,
    };
  });
};

export const getQuizSessionById = async (
  sessionId: string,
  userId: string,
): Promise<IQuizSession | null> => {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select(
      `
      *,
      ai_model_pricing!inner(
        model_name,
        provider:ai_providers!inner(
          name,
          display_name
        )
      )
    `,
    )
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch quiz session: ${error.message}`);
  }

  return {
    ...session,
    difficulty: session.difficulty as IQuizDifficulty,
    model_name: session.ai_model_pricing?.model_name,
    provider_name: session.ai_model_pricing?.provider?.name,
    provider_display_name: session.ai_model_pricing?.provider?.display_name,
  };
};

export const getQuizAttemptById = async (
  attemptId: string,
  userId: string,
): Promise<IQuizAttempt | null> => {
  const supabase = await createClient();

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch quiz attempt: ${error.message}`);
  }

  return attempt;
};

export const getQuizStatistics = async (userId: string) => {
  const supabase = await createClient();

  const { count: totalSessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (sessionsError) {
    throw new Error(`Failed to fetch quiz sessions count: ${sessionsError.message}`);
  }

  const { count: totalAttempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (attemptsError) {
    throw new Error(`Failed to fetch quiz attempts count: ${attemptsError.message}`);
  }

  const { data: avgData, error: avgError } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('user_id', userId);

  if (avgError) {
    throw new Error(`Failed to fetch average score: ${avgError.message}`);
  }

  const averageScore =
    avgData.length > 0
      ? Math.round(avgData.reduce((sum, attempt) => sum + attempt.score, 0) / avgData.length)
      : 0;

  const { data: recentAttempts, error: recentError } = await supabase
    .from('quiz_attempts')
    .select(
      `
      *,
      quiz_sessions!inner(
        title,
        videos!inner(title, youtube_id)
      )
    `,
    )
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5);

  if (recentError) {
    throw new Error(`Failed to fetch recent attempts: ${recentError.message}`);
  }

  return {
    totalSessions: totalSessions || 0,
    totalAttempts: totalAttempts || 0,
    averageScore,
    recentAttempts: recentAttempts || [],
  };
};

export const deleteQuizSession = async (sessionId: string, userId: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete quiz session: ${error.message}`);
  }
};
