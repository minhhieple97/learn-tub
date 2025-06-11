import { QuizDetailContent } from '@/features/dashboard/components/quiz-detail';
import { getQuizSessionDetail } from '@/features/dashboard/queries/quiz-dashboard-queries';
import { getProfileInSession } from '@/features/profile/queries';
import { notFound } from 'next/navigation';

type QuizDetailPageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { quizId } = await params;
  const profile = await getProfileInSession();
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
