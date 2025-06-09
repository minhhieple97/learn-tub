import { QuizDashboard } from '@/features/dashboard/components/quiz-dashboard';
import {
  getQuizDashboardData,
  getUserVideos,
} from '@/features/dashboard/queries/quiz-dashboard-queries';
import { getProfileInSession } from '@/features/profile/queries/profile';
import type { QuizFilters } from '@/features/dashboard/types';

type SearchParams = Promise<{
  search?: string;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'mixed';
  videoId?: string;
  sortBy?: 'created_at' | 'score' | 'attempts';
  sortOrder?: 'asc' | 'desc';
  page?: string;
}>;

type QuizDashboardPageProps = {
  searchParams: SearchParams;
};

const QuizDashboardContent = async ({
  searchParams,
}: QuizDashboardPageProps) => {
  const params = await searchParams;
  const profile = await getProfileInSession();

  const filters: Partial<QuizFilters> = {
    search: params.search || '',
    difficulty: (params.difficulty || 'all') as QuizFilters['difficulty'],
    videoId: params.videoId,
    sortBy: (params.sortBy || 'created_at') as QuizFilters['sortBy'],
    sortOrder: (params.sortOrder || 'desc') as QuizFilters['sortOrder'],
    page: parseInt(params.page || '1'),
    limit: 10,
  };

  const [data, videos] = await Promise.all([
    getQuizDashboardData(profile.id, filters),
    getUserVideos(profile.id),
  ]);

  return (
    <QuizDashboard initialData={data} videos={videos} userId={profile.id} />
  );
};

export default function QuizDashboardPage({
  searchParams,
}: QuizDashboardPageProps) {
  return (
    <div className="container mx-auto">
      <QuizDashboardContent searchParams={searchParams} />
    </div>
  );
}
