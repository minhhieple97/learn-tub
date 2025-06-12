import { getQuizSessionDetail } from '@/features/dashboard/queries/quiz-dashboard-queries';

import { notFound } from 'next/navigation';
import { QuizRetakeContent } from '@/features/quizzes/components/quiz-retake-content';
import { getProfileInSession } from '@/lib/require-auth';

type IQuizRetakePageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizRetakePage({ params }: IQuizRetakePageProps) {
  const { quizId } = await params;
  const profile = await getProfileInSession();
  const quizSession = await getQuizSessionDetail(quizId, profile.id);
  if (!quizSession) {
    notFound();
  }
  return (
    <div className="container mx-auto">
      <QuizRetakeContent quizSession={quizSession} />
    </div>
  );
}
