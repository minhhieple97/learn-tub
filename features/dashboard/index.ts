export { DashboardContent } from './components/dashboard-content';
export { DashboardHeader } from './components/dashboard-header';
export { StatCard } from './components/stat-card';
export { StatsGrid } from './components/stats-grid';
export { RecentVideosCard } from './components/recent-videos-card';
export { LearningGoalsCard } from './components/learning-goals-card';

export {
  getDashboardStats,
  getRecentVideos,
  getLearningGoals,
} from './queries/dashboard-queries';

// Types
export type {
  DashboardStats,
  StatCard as StatCardType,
  RecentVideo,
  LearningGoal,
} from './types';
