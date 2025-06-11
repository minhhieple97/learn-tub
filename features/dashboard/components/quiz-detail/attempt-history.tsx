'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { IQuizAttempt } from '@/features/quizzes/types';

type IAttemptHistoryProps = {
  attempts: IQuizAttempt[];
};

const getScoreBadgeVariant = (score: number) => {
  if (score >= 80) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800';
  }
  if (score >= 60) {
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800';
  }
  return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const AttemptHistory = ({ attempts }: IAttemptHistoryProps) => {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Attempt History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attempts.map((attempt, index) => (
            <div
              key={attempt.id}
              className="flex items-center justify-between p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge className={`${getScoreBadgeVariant(attempt.score)} border font-medium`}>
                  {attempt.score}%
                </Badge>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                      {attempt.correct_answers}/{attempt.total_questions}
                    </span>
                    <span className="text-muted-foreground">correct</span>
                  </div>
                  {attempt.time_taken_seconds && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatTime(attempt.time_taken_seconds)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {attempt.completed_at &&
                    formatDistanceToNow(new Date(attempt.completed_at), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
