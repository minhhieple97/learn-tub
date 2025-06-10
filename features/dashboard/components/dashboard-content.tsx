import { InsightsDashboard } from '@/features/dashboard/components/insights-dashboard';
import { DashboardHeader } from './dashboard-header';
import { StatsGrid } from './stats-grid';
import { RecentVideosCard } from './recent-videos-card';
import { LearningGoalsCard } from './learning-goals-card';
import type {
  DashboardStats,
  RecentVideo,
  LearningGoal,
  InsightsData,
} from '../types';

type IDashboardContentProps = {
  stats: DashboardStats;
  recentVideos: RecentVideo[];
  learningGoals: LearningGoal[];
  insightsData: InsightsData;
};

export const DashboardContent = ({
  stats,
  recentVideos,
  learningGoals,
  insightsData,
}: IDashboardContentProps) => {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Track your learning progress and discover new content"
      />

      <StatsGrid stats={stats} />

      <InsightsDashboard data={insightsData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentVideosCard videos={recentVideos} />
        <LearningGoalsCard goals={learningGoals} />
      </div>
    </div>
  );
};
