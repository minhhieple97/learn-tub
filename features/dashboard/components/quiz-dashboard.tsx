'use client';

import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAction } from 'next-safe-action/hooks';
import { retakeQuizAction } from '../actions/quiz-actions';
import { QuizDashboardStats } from './quiz-dashboard-stats';
import { QuizDashboardFilters } from './quiz-dashboard-filters';
import { QuizSessionCard } from './quiz-session-card';
import { QuizPagination } from './quiz-pagination';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { IQuizFilters, IQuizDashboardData } from '../types';
import { IQuizSessionWithAttempts } from '@/features/quizzes/types';

const fetchQuizDashboardData = async (
  filters: Partial<IQuizFilters>,
): Promise<IQuizDashboardData> => {
  const searchParams = new URLSearchParams();

  if (filters.search) searchParams.set('search', filters.search);
  if (filters.difficulty && filters.difficulty !== 'all')
    searchParams.set('difficulty', filters.difficulty);
  if (filters.videoId) searchParams.set('videoId', filters.videoId);
  if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
  if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
  if (filters.page) searchParams.set('page', filters.page.toString());
  if (filters.limit) searchParams.set('limit', filters.limit.toString());

  const response = await fetch(
    `/api/quiz-dashboard?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch quiz dashboard data: ${response.statusText}`,
    );
  }

  return response.json();
};

type Video = {
  id: string;
  title: string;
  youtube_id: string;
};

type QuizDashboardProps = {
  initialData: {
    sessions: IQuizSessionWithAttempts[];
    totalSessions: number;
    totalAttempts: number;
    averageScore: number;
    totalPages: number;
    currentPage: number;
  };
  videos: Video[];
};

export const QuizDashboard = ({ initialData, videos }: QuizDashboardProps) => {
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
    queryKey: ['quiz-dashboard', filters],
    queryFn: () => fetchQuizDashboardData(filters),
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
