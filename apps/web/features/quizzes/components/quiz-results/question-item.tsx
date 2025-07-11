"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IQuizResult } from "../../types";

type QuestionItemProps = {
  result: IQuizResult;
};

export const QuestionItem = ({ result }: QuestionItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "rounded-full p-1 mt-1 shadow-sm",
          result.isCorrect
            ? "bg-emerald-200 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300"
            : "bg-red-200 text-red-700 dark:bg-red-800/50 dark:text-red-300",
        )}
      >
        {result.isCorrect ? (
          <CheckCircle className="size-4" />
        ) : (
          <XCircle className="size-4" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-500 dark:text-slate-200">
          {result.question}
        </p>
        <div className="mt-2 text-sm text-slate-700 dark:text-slate-400">
          <p>
            Your answer:{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {result.selectedAnswer}
            </span>
          </p>
          <p>
            Correct answer:{" "}
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {result.correctAnswer}
            </span>
          </p>
          {result.explanation && (
            <p className="mt-1 italic text-slate-700 dark:text-slate-400">
              {result.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
