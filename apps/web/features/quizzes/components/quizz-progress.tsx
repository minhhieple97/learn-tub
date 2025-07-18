"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuizStore } from "../store";

export const QuizzProgress = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    getProgress,
    getAnsweredCount,
  } = useQuizStore();

  const progress = getProgress();
  const answeredCount = getAnsweredCount();
  const totalQuestions = questions.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          {answeredCount} answered
        </span>
      </div>
      <Progress
        value={progress}
        className="h-3 bg-slate-200 dark:bg-slate-700"
      />
      <div className="flex items-center gap-1 justify-center">
        {Array.from({ length: Math.min(totalQuestions, 10) }).map(
          (_, index) => {
            const questionIndex = Math.floor(
              (index * totalQuestions) / Math.min(totalQuestions, 10),
            );
            const isAnswered = answers.some(
              (a) => a.questionId === questions[questionIndex]?.id,
            );
            const isCurrent =
              Math.abs(questionIndex - currentQuestionIndex) <=
              totalQuestions / 20;

            return (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  isAnswered
                    ? "bg-emerald-500"
                    : isCurrent
                      ? "bg-blue-500"
                      : "bg-slate-300 dark:bg-slate-600",
                )}
              />
            );
          },
        )}
      </div>
    </div>
  );
};
