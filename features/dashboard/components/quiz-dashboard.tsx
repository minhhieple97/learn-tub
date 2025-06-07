'use client';

import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAction } from 'next-safe-action/hooks';
import { retakeQuizAction } from '../actions/quiz-dashboard-actions';
import { QuizSessionWithAttempts } from '@/features/ai';
import { QuizDashboardStats } from './quiz-dashboard-stats';
import { QuizDashboardFilters } from './quiz-dashboard-filters';
import { QuizSessionCard } from './quiz-session-card';
import { QuizPagination } from './quiz-pagination';

type Video = {
  id: string;
  title: string;
  youtube_id: string;
};

type QuizDashboardProps = {
  initialData: {
    sessions: QuizSessionWithAttempts[];
    totalSessions: number;
    totalAttempts: number;
    averageScore: number;
    totalPages: number;
    currentPage: number;
  };
  videos: Video[];
};

export const QuizDashboard = ({ initialData, videos }: QuizDashboardProps) => {
  const { execute: executeRetake, isExecuting: isRetaking } =
    useAction(retakeQuizAction);

  const handleRetakeQuiz = async (sessionId: string) => {
    executeRetake({ sessionId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Brain className="h-6 w-6" />
            Quiz Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your quiz history and track your learning progress
          </p>
        </div>
      </div>

      <QuizDashboardStats
        totalSessions={initialData.totalSessions}
        totalAttempts={initialData.totalAttempts}
        averageScore={initialData.averageScore}
      />

      <QuizDashboardFilters videos={videos} />

      <div className="space-y-4">
        {initialData.sessions.map((session) => (
          <QuizSessionCard
            key={session.id}
            session={session}
            onRetake={handleRetakeQuiz}
            isRetaking={isRetaking}
          />
        ))}

        {initialData.sessions.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-card-foreground">
                No quizzes found
              </h3>
              <p className="text-muted-foreground mb-4">
                Start creating quizzes from your videos to track your learning
                progress.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {initialData.sessions.length > 0 && (
        <QuizPagination
          currentPage={initialData.currentPage}
          totalPages={initialData.totalPages}
          totalItems={initialData.totalSessions}
          itemsPerPage={10}
        />
      )}
    </div>
  );
};
