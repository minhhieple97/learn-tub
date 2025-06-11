import { DashboardContent } from '@/features/dashboard';
import {
  getDashboardStats,
  getInsightsData,
  getLearningGoals,
  getRecentVideos,
} from '@/features/dashboard/queries/dashboard-queries';

export default async function DashboardPage() {
  const [stats, recentVideos, learningGoals, insightsData] = await Promise.all([
    getDashboardStats(),
    getRecentVideos(),
    getLearningGoals(),
    getInsightsData(),
  ]);

  return (
    <DashboardContent
      stats={stats}
      recentVideos={recentVideos}
      learningGoals={learningGoals}
      insightsData={insightsData}
    />
  );
}
