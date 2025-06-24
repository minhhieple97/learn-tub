import {
  IQuizAttempt,
  IQuizDifficultyFilter,
  IQuizSessionWithAttempts,
} from '../quizzes/types';
import { Tables } from '@/database.types';

export type IDashboardStats = {
  totalVideos: number;
  learningTime: string;
  notesCreated: number;
  streak: number;
};

export type IStatCardProps = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type IRecentVideo = {
  id: string;
  title: string;
  timeAgo: string;
  thumbnail?: string;
};

export type ILearningGoal = {
  id: string;
  title: string;
  current: number;
  target: number;
  percentage: number;
  color: string;
};

export type IQuizDashboardData = {
  sessions: IQuizSessionWithAttempts[];
  totalSessions: number;
  totalAttempts: number;
  averageScore: number;
  recentAttempts: IQuizAttempt[];
  totalPages: number;
  currentPage: number;
};

export type IInsightsData = {
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
  difficulty: IQuizDifficultyFilter;
  videoId?: string;
  sortBy: 'created_at' | 'score' | 'attempts';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
};

export type IQuizFilterParams = Omit<IQuizFilters, 'limit'>;
