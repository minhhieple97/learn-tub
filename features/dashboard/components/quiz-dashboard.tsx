'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Trophy,
  Clock,
  Target,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAction } from 'next-safe-action/hooks';
import { retakeQuizAction } from '../actions/quiz-dashboard-actions';
import { useQueryState, parseAsString } from 'nuqs';
import { QuizSessionWithAttempts } from '@/features/ai';

type QuizDashboardProps = {
  initialData: {
    sessions: QuizSessionWithAttempts[];
    totalSessions: number;
    totalAttempts: number;
    averageScore: number;
  };
};

export const QuizDashboard = ({ initialData }: QuizDashboardProps) => {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const [difficulty, setDifficulty] = useQueryState(
    'difficulty',
    parseAsString.withDefault('all'),
  );
  const [sortBy, setSortBy] = useQueryState(
    'sortBy',
    parseAsString.withDefault('created_at'),
  );

  const { execute: executeRetake, isExecuting: isRetaking } =
    useAction(retakeQuizAction);

  const handleRetakeQuiz = async (sessionId: string) => {
    executeRetake({ sessionId });
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'mixed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Quizzes
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {initialData.totalSessions}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Attempts
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {initialData.totalAttempts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Average Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {initialData.averageScore}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Completion Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {initialData.totalSessions > 0
                ? Math.round(
                    (initialData.totalAttempts / initialData.totalSessions) *
                      100,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input text-foreground">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem
                  value="all"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  All Difficulties
                </SelectItem>
                <SelectItem
                  value="easy"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Easy
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Medium
                </SelectItem>
                <SelectItem
                  value="hard"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Hard
                </SelectItem>
                <SelectItem
                  value="mixed"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Mixed
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input text-foreground">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem
                  value="created_at"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Date Created
                </SelectItem>
                <SelectItem
                  value="score"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Best Score
                </SelectItem>
                <SelectItem
                  value="attempts"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Attempts
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {initialData.sessions.map((session) => (
          <Card
            key={session.id}
            className="border-border bg-card hover:bg-accent/5 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-card-foreground">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {session.videos?.title || 'Video not found'}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Created{' '}
                    {formatDistanceToNow(new Date(session.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(session.difficulty)}>
                    {session.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border text-foreground"
                  >
                    {session.question_count} questions
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Attempts Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-card-foreground">
                    <span>
                      Attempts: <strong>{session.attempt_count}</strong>
                    </span>
                    {session.best_score !== undefined && (
                      <span>
                        Best Score: <strong>{session.best_score}%</strong>
                      </span>
                    )}
                    {session.latest_attempt && (
                      <span>
                        Last Attempt:{' '}
                        {formatDistanceToNow(
                          new Date(session.latest_attempt.completed_at),
                          { addSuffix: true },
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRetakeQuiz(session.id)}
                      disabled={isRetaking}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retake Quiz
                    </Button>
                  </div>
                </div>

                {/* Recent Attempts */}
                {session.attempts.length > 0 && (
                  <div>
                    <Separator className="mb-3 bg-border" />
                    <h4 className="text-sm font-medium mb-2 text-card-foreground">
                      Recent Attempts
                    </h4>
                    <div className="space-y-2">
                      {session.attempts.slice(0, 3).map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-2 bg-muted/50 dark:bg-muted/20 rounded border border-border/50"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <Badge
                              variant={getScoreBadgeVariant(attempt.score)}
                            >
                              {attempt.score}%
                            </Badge>
                            <span className="text-foreground">
                              {attempt.correct_answers}/
                              {attempt.total_questions} correct
                            </span>
                            {attempt.time_taken_seconds && (
                              <span className="text-muted-foreground">
                                {Math.floor(attempt.time_taken_seconds / 60)}m{' '}
                                {attempt.time_taken_seconds % 60}s
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(attempt.completed_at),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};
