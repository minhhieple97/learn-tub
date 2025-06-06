import type { DashboardStats, RecentVideo, LearningGoal } from '../types';

// Mock data - replace with actual database queries
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return {
    totalVideos: 12,
    learningTime: '24h 30m',
    notesCreated: 89,
    streak: 7,
  };
};

export const getRecentVideos = async (): Promise<RecentVideo[]> => {
  return [
    {
      id: '1',
      title: 'React Hooks Tutorial',
      timeAgo: '2 hours ago',
    },
    {
      id: '2',
      title: 'Next.js 15 Features',
      timeAgo: '1 day ago',
    },
  ];
};

export const getLearningGoals = async (): Promise<LearningGoal[]> => {
  return [
    {
      id: '1',
      title: 'Watch 5 videos',
      current: 3,
      target: 5,
      percentage: 60,
      color: 'bg-blue-600',
    },
    {
      id: '2',
      title: 'Take 50 notes',
      current: 32,
      target: 50,
      percentage: 64,
      color: 'bg-green-600',
    },
  ];
};
