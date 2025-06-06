'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import type { Question, Answer } from '../types';

type QuizNavigationProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAnswer?: Answer;
  canGoNext: boolean;
  canGoPrevious: boolean;
  hasAnsweredAll: boolean;
  isEvaluating: boolean;
  questions: Question[];
  answers: Answer[];
  onPrevious: () => void;
  onNext: () => void;
  onGoToQuestion: (index: number) => void;
  onSubmitQuiz: () => void;
};

export const QuizNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  currentAnswer,
  canGoNext,
  canGoPrevious,
  hasAnsweredAll,
  isEvaluating,
  questions,
  answers,
  onPrevious,
  onNext,
  onGoToQuestion,
  onSubmitQuiz,
}: QuizNavigationProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Select
          value={currentQuestionIndex.toString()}
          onValueChange={(value) => onGoToQuestion(parseInt(value))}
        >
          <SelectTrigger className="w-[200px] border-slate-300 dark:border-slate-600">
            <SelectValue>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {questions.map((question, index) => {
              const isAnswered = answers.some(
                (a) => a.questionId === question.id,
              );

              return (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex w-full items-center gap-2">
                    <span className="font-medium">Q{index + 1}</span>
                    {isAnswered && (
                      <CheckCircle className="size-3 text-emerald-600" />
                    )}
                    <span className="max-w-[150px] truncate text-xs text-slate-500 dark:text-slate-400">
                      {question.question.slice(0, 30)}...
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2 px-6 border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
            <span>{currentQuestionIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">
              {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {currentAnswer ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="size-3" />
                <span>Answered</span>
              </div>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Not answered
              </span>
            )}
          </div>
        </div>

        {canGoNext ? (
          <Button
            onClick={onNext}
            className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmitQuiz}
            disabled={!hasAnsweredAll || isEvaluating}
            className="flex items-center gap-2 bg-green-600 px-6 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shadow-lg"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="size-4 animate-spin text-white" />
                <span className="text-white">Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="size-4 text-white" />
                <span className="text-white">Submit Quiz</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
