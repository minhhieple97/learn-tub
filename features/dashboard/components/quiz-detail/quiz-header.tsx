'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QuizSessionWithAttempts } from '@/features/ai';

type QuizHeaderProps = {
  quizSession: QuizSessionWithAttempts;
};

export const QuizHeader = ({ quizSession }: QuizHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard/quizzes">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Button>
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {quizSession.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {quizSession.videos?.title || 'Video not found'}
        </p>
      </div>
    </div>
  );
};
