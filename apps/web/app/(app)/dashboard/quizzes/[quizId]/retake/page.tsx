import { getQuizSessionDetail } from "@/features/dashboard/queries/quiz-dashboard-queries";

import { notFound } from "next/navigation";
import { QuizzRetakeContent } from "@/features/quizzes/components/quizz-retake-content";
import { checkProfile } from "@/lib/require-auth";

type IQuizRetakePageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizRetakePage({ params }: IQuizRetakePageProps) {
  const { quizId } = await params;
  const profile = await checkProfile();
  const quizSession = await getQuizSessionDetail(quizId, profile.id);
  if (!quizSession) {
    notFound();
  }
  return (
    <div className="container mx-auto">
      <QuizzRetakeContent quizSession={quizSession} />
    </div>
  );
}
