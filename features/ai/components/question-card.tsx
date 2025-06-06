'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Question, Answer } from '../types';

type QuestionCardProps = {
  question: Question;
  currentAnswer?: Answer;
  onAnswerSelect: (selectedAnswer: 'A' | 'B' | 'C' | 'D') => void;
};

export const QuestionCard = ({
  question,
  currentAnswer,
  onAnswerSelect,
}: QuestionCardProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          >
            {question.topic}
          </Badge>
          <Badge
            variant={
              question.difficulty === 'easy'
                ? 'default'
                : question.difficulty === 'medium'
                ? 'secondary'
                : 'destructive'
            }
            className={cn(
              question.difficulty === 'easy' &&
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
              question.difficulty === 'medium' &&
                'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
              question.difficulty === 'hard' &&
                'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
            )}
          >
            {question.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-relaxed text-slate-800 dark:text-slate-200">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {Object.entries(question.options).map(([key, value]) => (
            <Button
              key={key}
              variant={
                currentAnswer?.selectedAnswer === key ? 'default' : 'outline'
              }
              className={cn(
                'justify-start p-4 h-auto text-left whitespace-normal transition-all duration-200',
                currentAnswer?.selectedAnswer === key
                  ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 dark:ring-blue-500 shadow-md'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/30',
              )}
              onClick={() => onAnswerSelect(key as 'A' | 'B' | 'C' | 'D')}
            >
              <span className="mr-3 font-semibold">{key}.</span>
              <span>{value}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
