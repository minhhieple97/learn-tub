'use client';

import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAction } from 'next-safe-action/hooks';
import { retakeQuizAction } from '../actions/quiz-dashboard-actions';
import { QuizDashboardStats } from './quiz-dashboard-stats';
import { QuizDashboardFilters } from './quiz-dashboard-filters';
import { QuizSessionCard } from './quiz-session-card';
import { QuizPagination } from './quiz-pagination';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { getQuizDashboardData } from '../queries/quiz-dashboard-queries';
import { QuizSessionWithAttempts } from '@/features/quizzes/types';
import { IQuizFilters } from '../types';

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
  userId: string;
};

export const QuizDashboard = ({
  initialData,
  videos,
  userId,
}: QuizDashboardProps) => {
  const [search] = useQueryState('search', parseAsString.withDefault(''));
  const [difficulty] = useQueryState(
    'difficulty',
    parseAsString.withDefault('all'),
  );
  const [videoId] = useQueryState('videoId', parseAsString.withDefault('all'));
  const [sortBy] = useQueryState(
    'sortBy',
    parseAsString.withDefault('created_at'),
  );
  const [sortOrder] = useQueryState(
    'sortOrder',
    parseAsString.withDefault('desc'),
  );
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));

  const filters: Partial<IQuizFilters> = {
    search,
    difficulty: difficulty as IQuizFilters['difficulty'],
    videoId: videoId === 'all' ? undefined : videoId,
    sortBy: sortBy as IQuizFilters['sortBy'],
    sortOrder: sortOrder as IQuizFilters['sortOrder'],
    page,
    limit: 10,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-dashboard', userId, filters],
    queryFn: () => getQuizDashboardData(userId, filters),
    initialData,
  });

  const { execute: executeRetake, isExecuting: isRetaking } =
    useAction(retakeQuizAction);

  const handleRetakeQuiz = async (sessionId: string) => {
    executeRetake({ sessionId });
  };

  if (isLoading) {
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
        totalSessions={data.totalSessions}
        totalAttempts={data.totalAttempts}
        averageScore={data.averageScore}
      />

      <QuizDashboardFilters videos={videos} />

      <div className="space-y-4">
        {data.sessions.map((session) => (
          <QuizSessionCard
            key={session.id}
            session={session}
            onRetake={handleRetakeQuiz}
            isRetaking={isRetaking}
          />
        ))}

        {data.sessions.length === 0 && (
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

      {data.sessions.length > 0 && (
        <QuizPagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalSessions}
          itemsPerPage={10}
        />
      )}
    </div>
  );
};
