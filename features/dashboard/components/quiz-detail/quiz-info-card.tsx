'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QuizSessionWithAttempts } from '@/features/ai';
import { QuizRetakeButton } from './quiz-retake-button';

type QuizInfoCardProps = {
  quizSession: QuizSessionWithAttempts;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50';
    case 'mixed':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50';
  }
};

export const QuizInfoCard = ({ quizSession }: QuizInfoCardProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {quizSession.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Created{' '}
                {formatDistanceToNow(new Date(quizSession.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              className={`${getDifficultyColor(quizSession.difficulty)} border`}
            >
              {quizSession.difficulty}
            </Badge>
            <Badge variant="outline" className="border-border">
              {quizSession.question_count} questions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="text-sm">
                <span className="text-muted-foreground">Attempts:</span>
                <span className="ml-1 font-medium text-foreground">
                  {quizSession.attempt_count}
                </span>
              </div>
            </div>
            {quizSession.best_score !== undefined && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Best Score:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {quizSession.best_score}%
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="text-sm">
                <span className="text-muted-foreground">AI Model:</span>
                <span className="ml-1 font-medium text-foreground">
                  {quizSession.ai_model}
                </span>
              </div>
            </div>
          </div>

          <QuizRetakeButton quizSession={quizSession} />
        </div>
      </CardContent>
    </Card>
  );
};
