import { InsightsDashboard } from "@/features/dashboard/components/insights-dashboard";
import { DashboardHeader } from "./dashboard-header";
import { StatsGrid } from "./stats-grid";
import type {
  IDashboardStats,
  IRecentVideo,
  ILearningGoal,
  IInsightsData,
} from "../types";

type IDashboardContentProps = {
  stats: IDashboardStats;
  recentVideos: IRecentVideo[];
  learningGoals: ILearningGoal[];
  insightsData: IInsightsData;
};

export const DashboardContent = ({
  stats,
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
    </div>
  );
};
