import { QuizDashboard } from '@/features/dashboard/components/quiz-dashboard';
import {
  getQuizDashboardData,
  getUserVideos,
} from '@/features/dashboard/queries/quiz-dashboard-queries';
import { getProfileInSession } from '@/features/profile/queries/profile';

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

  const filters = {
    search: params.search || '',
    difficulty: params.difficulty || 'all',
    videoId: params.videoId,
    sortBy: params.sortBy || 'created_at',
    sortOrder: params.sortOrder || 'desc',
    page: parseInt(params.page || '1'),
    limit: 10,
  };

  const [data, videos] = await Promise.all([
    getQuizDashboardData(profile.id, filters),
    getUserVideos(profile.id),
  ]);

  return <QuizDashboard initialData={data} videos={videos} />;
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
