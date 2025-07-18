"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { useQuizStore } from "../store";

export const QuizzNavigation = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    isEvaluating,
    getCurrentAnswer,
    getHasAnsweredAll,
    getCanGoNext,
    getCanGoPrevious,
    getFormattedTime,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
  } = useQuizStore();

  const currentAnswer = getCurrentAnswer();
  const hasAnsweredAll = getHasAnsweredAll();
  const canGoNext = getCanGoNext();
  const canGoPrevious = getCanGoPrevious();
  const formattedTime = getFormattedTime();
  const totalQuestions = questions.length;

  return (
    <div className="space-y-4">
      {formattedTime && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Clock className="size-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
              {formattedTime}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Select
          value={currentQuestionIndex.toString()}
          onValueChange={(value) => goToQuestion(parseInt(value))}
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
          onClick={previousQuestion}
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
            onClick={nextQuestion}
            className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={submitQuiz}
            disabled={!hasAnsweredAll || isEvaluating}
            variant="success"
            className="flex items-center gap-2 px-6"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="size-4" />
                <span>Submit Quiz</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
