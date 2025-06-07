import {
  DashboardContent,
  getDashboardStats,
  getRecentVideos,
  getLearningGoals,
} from '@/features/dashboard';

export default async function DashboardPage() {
  // Fetch data in parallel
  const [stats, recentVideos, learningGoals] = await Promise.all([
    getDashboardStats(),
    getRecentVideos(),
    getLearningGoals(),
  ]);

  return (
    <DashboardContent
      stats={stats}
      recentVideos={recentVideos}
      learningGoals={learningGoals}
    />
  );
}
