import { QuizDashboard } from '@/features/dashboard/components/quiz-dashboard';
import { getQuizDashboardData } from '@/features/dashboard/queries/quiz-dashboard-queries';
import { getProfileInSession } from '@/features/profile/queries/profile';

type SearchParams = Promise<{
  search?: string;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'mixed';
  sortBy?: 'created_at' | 'score' | 'attempts';
  sortOrder?: 'asc' | 'desc';
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
    sortBy: params.sortBy || 'created_at',
    sortOrder: params.sortOrder || 'desc',
  };

  const data = await getQuizDashboardData(profile.id, filters);

  return <QuizDashboard initialData={data} />;
};

export default function QuizDashboardPage({
  searchParams,
}: QuizDashboardPageProps) {
  return (
    <div className="container mx-auto py-6">
      <QuizDashboardContent searchParams={searchParams} />
    </div>
  );
}
