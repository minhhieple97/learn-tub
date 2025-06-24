'use client';

import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizSessionCard } from './quiz-session-card';
import type { IQuizSessionWithAttempts } from '@/features/quizzes/types';

type QuizSessionsListProps = {
  sessions: IQuizSessionWithAttempts[];
  onRetake: (sessionId: string) => Promise<void>;
  isRetaking: boolean;
};

export const QuizSessionsList = ({ sessions, onRetake, isRetaking }: QuizSessionsListProps) => {
  if (sessions.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-card-foreground">No quizzes found</h3>
          <p className="text-muted-foreground mb-4">
            Start creating quizzes from your videos to track your learning progress.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create Your First Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <QuizSessionCard
          key={session.id}
          session={session}
          onRetake={onRetake}
          isRetaking={isRetaking}
        />
      ))}
    </div>
  );
};
