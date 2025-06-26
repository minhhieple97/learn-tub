"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IQuizFeedback } from "../types";
import { useQuizStore } from "../store";

type IQuizzResultsProps = {
  feedback: IQuizFeedback;
  isGenerating: boolean;
};

export const QuizzResults = ({ feedback }: IQuizzResultsProps) => {
  const { resetQuiz } = useQuizStore();
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 border-blue-300 dark:border-blue-600 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-800/50 dark:to-yellow-800/50 p-6 shadow-lg">
              <Trophy className="size-12 text-amber-700 dark:text-amber-300" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r text-pretty">
              {feedback.score}%
            </CardTitle>
            <p className="text-primary">
              {feedback.correctAnswers} out of {feedback.totalQuestions} correct
            </p>
          </CardHeader>
        </Card>
        <Card className="border-slate-300 dark:border-slate-600">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800/50 dark:to-blue-900/50">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-300">
              <BookOpen className="size-5 text-blue-700 dark:text-blue-300" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-slate-800 dark:text-slate-300">
              {feedback.overallFeedback}
            </p>
          </CardContent>
        </Card>
        {feedback.strengths.length > 0 && (
          <Card className="border-emerald-300 dark:border-emerald-700">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50">
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <TrendingUp className="size-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-800 dark:text-slate-300">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {feedback.areasForImprovement.length > 0 && (
          <Card className="border-amber-300 dark:border-amber-700">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Target className="size-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-slate-800 dark:text-slate-300">
                      {area}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        <Card className="border-slate-300 dark:border-slate-600">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800/50 dark:to-blue-900/50">
            <CardTitle className="text-slate-800 dark:text-slate-300">
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedback.results.map((result, index) => (
                <div key={result.questionId} className="space-y-2">
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
                      <p className="font-medium text-slate-900 dark:text-slate-200">
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
                  {index < feedback.results.length - 1 && (
                    <Separator className="bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={resetQuiz}
            className="border-slate-400 hover:bg-slate-200 dark:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
