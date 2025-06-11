import { IQuizAttempt, IQuizSessionWithAttempts } from '../quizzes/types';
import { Tables } from '@/database.types';

export type DashboardStats = {
  totalVideos: number;
  learningTime: string;
  notesCreated: number;
  streak: number;
};

export type StatCard = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type RecentVideo = {
  id: string;
  title: string;
  timeAgo: string;
  thumbnail?: string;
};

export type LearningGoal = {
  id: string;
  title: string;
  current: number;
  target: number;
  percentage: number;
  color: string;
};

export type QuizDashboardData = {
  sessions: IQuizSessionWithAttempts[];
  totalSessions: number;
  totalAttempts: number;
  averageScore: number;
  recentAttempts: IQuizAttempt[];
  totalPages: number;
  currentPage: number;
};

export type InsightsData = {
  analysisCount: number;
  quizStats: {
    totalSessions: number;
    totalAttempts: number;
    averageScore: number;
    recentAttempts: (Tables<'quiz_attempts'> & {
      quiz_sessions: {
        title: string;
        videos: {
          title: string;
          youtube_id: string;
        };
      };
    })[];
  };
  studyPlanCount: number;
};

export type IQuizFilters = {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'mixed';
  videoId?: string;
  sortBy: 'created_at' | 'score' | 'attempts';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
};
