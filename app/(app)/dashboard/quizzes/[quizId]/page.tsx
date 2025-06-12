import { QuizDetailContent } from '@/features/dashboard/components/quiz-detail';
import { getQuizSessionDetail } from '@/features/dashboard/queries/quiz-dashboard-queries';
import { checkProfile } from '@/lib/require-auth';

import { notFound } from 'next/navigation';

type IQuizDetailPageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizDetailPage({ params }: IQuizDetailPageProps) {
  const { quizId } = await params;
  const profile = await checkProfile();
  const quizSession = await getQuizSessionDetail(quizId, profile.id);
  if (!quizSession) {
    notFound();
  }
  return (
    <div className="container mx-auto">
      <QuizDetailContent quizSession={quizSession} />
    </div>
  );
}
