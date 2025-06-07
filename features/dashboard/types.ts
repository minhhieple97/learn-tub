import type { QuizSessionWithAttempts, QuizAttempt } from '@/features/ai/types';

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
  sessions: QuizSessionWithAttempts[];
  totalSessions: number;
  totalAttempts: number;
  averageScore: number;
  recentAttempts: QuizAttempt[];
};

export type QuizFilters = {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'mixed';
  sortBy: 'created_at' | 'score' | 'attempts';
  sortOrder: 'asc' | 'desc';
};
