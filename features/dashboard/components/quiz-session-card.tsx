import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QuizSessionWithAttempts } from '@/features/ai';
import { memo } from 'react';
import Link from 'next/link';

type QuizSessionCardProps = {
  session: QuizSessionWithAttempts;
  onRetake: (sessionId: string) => void;
  isRetaking: boolean;
};

const QuizSessionCardComponent = ({
  session,
  onRetake,
  isRetaking,
}: QuizSessionCardProps) => {
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800/40';
      case 'hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40';
      case 'mixed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/60';
    }
  };

  return (
    <Card className="border-border/50 bg-card hover:bg-accent/5 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground leading-tight">
              {session.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
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
              className="border-border/60 text-foreground bg-background/50"
            >
              {session.question_count} questions
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-card-foreground flex-wrap">
              <span className="font-medium">
                Attempts:{' '}
                <strong className="text-foreground">
                  {session.attempt_count}
                </strong>
              </span>
              {session.best_score !== undefined && (
                <span className="font-medium">
                  Best Score:{' '}
                  <strong className="text-foreground">
                    {session.best_score}%
                  </strong>
                </span>
              )}
              {session.latest_attempt && (
                <span className="font-medium text-muted-foreground">
                  Last Attempt:{' '}
                  {formatDistanceToNow(
                    new Date(session.latest_attempt.completed_at),
                    { addSuffix: true },
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/dashboard/quizzes/${session.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/60 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => onRetake(session.id)}
                disabled={isRetaking}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retake Quiz
              </Button>
            </div>
          </div>

          {session.attempts.length > 0 && (
            <div className="space-y-3">
              <Separator className="bg-border/60" />
              <h4 className="text-sm font-semibold text-card-foreground">
                Recent Attempts
              </h4>
              <div className="space-y-2">
                {session.attempts.slice(0, 3).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-muted/40 dark:bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Badge
                        variant={getScoreBadgeVariant(attempt.score)}
                        className="font-medium"
                      >
                        {attempt.score}%
                      </Badge>
                      <span className="text-foreground font-medium">
                        {attempt.correct_answers}/{attempt.total_questions}{' '}
                        correct
                      </span>
                      {attempt.time_taken_seconds && (
                        <span className="text-muted-foreground">
                          {Math.floor(attempt.time_taken_seconds / 60)}m{' '}
                          {attempt.time_taken_seconds % 60}s
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(attempt.completed_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuizSessionCard = memo(QuizSessionCardComponent);
