'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { routes } from '@/routes';
import type { QuizSessionWithAttempts } from '@/features/ai/types';

type QuizRetakeButtonProps = {
  quizSession: QuizSessionWithAttempts;
};

export const QuizRetakeButton = ({ quizSession }: QuizRetakeButtonProps) => {
  const router = useRouter();

  const handleRetake = () => {
    router.push(routes.dashboard.quizRetake(quizSession.id));
  };

  return (
    <Button
      onClick={handleRetake}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <RotateCcw className="size-4" />
      Retake Quiz
    </Button>
  );
};
