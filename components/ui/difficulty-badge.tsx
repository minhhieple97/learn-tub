import * as React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { IQuizDifficulty } from '@/features/quizzes/types';

type DifficultyBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  difficulty: IQuizDifficulty;
  children?: React.ReactNode;
};

const getDifficultyStyles = (difficulty: IQuizDifficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900';
    case 'hard':
      return 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900';
    case 'mixed':
      return 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900';
  }
};

const DifficultyBadge = React.forwardRef<HTMLDivElement, DifficultyBadgeProps>(
  ({ difficulty, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(getDifficultyStyles(difficulty), className)}
        {...props}
      >
        <Badge variant={null}>{children || difficulty}</Badge>
      </div>
    );
  },
);

DifficultyBadge.displayName = 'DifficultyBadge';

export { DifficultyBadge, type DifficultyBadgeProps };
