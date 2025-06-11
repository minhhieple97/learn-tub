import { QuizDashboard } from '@/features/dashboard/components/quiz-dashboard';
import {
  getQuizDashboardData,
  getUserVideos,
} from '@/features/dashboard/queries/quiz-dashboard-queries';
import { getProfileInSession } from '@/features/profile/queries';
import type { IQuizFilters } from '@/features/dashboard/types';
import type { IQuizDifficultyFilter } from '@/features/quizzes/types';

type SearchParams = Promise<{
  search?: string;
  difficulty?: IQuizDifficultyFilter;
  videoId?: string;
  sortBy?: 'created_at' | 'score' | 'attempts';
  sortOrder?: 'asc' | 'desc';
  page?: string;
}>;

type IQuizDashboardPageProps = {
  searchParams: SearchParams;
};

export default async function QuizDashboardPage({ searchParams }: IQuizDashboardPageProps) {
  const params = await searchParams;
  const profile = await getProfileInSession();

  const filters: Partial<IQuizFilters> = {
    search: params.search || '',
    difficulty: (params.difficulty || 'all') as IQuizFilters['difficulty'],
    videoId: params.videoId,
    sortBy: (params.sortBy || 'created_at') as IQuizFilters['sortBy'],
    sortOrder: (params.sortOrder || 'desc') as IQuizFilters['sortOrder'],
    page: parseInt(params.page || '1'),
    limit: 10,
  };

  const [data, videos] = await Promise.all([
    getQuizDashboardData(profile.id, filters),
    getUserVideos(profile.id),
  ]);

  return (
    <div className="container mx-auto">
      <QuizDashboard initialData={data} videos={videos} userId={profile.id} />
    </div>
  );
}
