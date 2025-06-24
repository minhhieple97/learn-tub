'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QuizRetakeButton } from './quiz-retake-button';
import { DifficultyBadge } from '@/components/ui/difficulty-badge';
import { IQuizSessionWithAttempts } from '@/features/quizzes/types';

type IQuizInfoCardProps = {
  quizSession: IQuizSessionWithAttempts;
};

export const QuizInfoCard = ({ quizSession }: IQuizInfoCardProps) => {
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
                {quizSession.created_at
                  ? formatDistanceToNow(new Date(quizSession.created_at), {
                      addSuffix: true,
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DifficultyBadge difficulty={quizSession.difficulty} />
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
                <span className="ml-1 font-medium text-foreground">{quizSession.model_name}</span>
              </div>
            </div>
          </div>

          <QuizRetakeButton quizSessionId={quizSession.id} />
        </div>
      </CardContent>
    </Card>
  );
};
