'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFeedback } from '../types';

type QuizResultsProps = {
  feedback: QuizFeedback;
  isGenerating: boolean;
  onResetQuiz: () => void;
  onGenerateNewQuiz: () => void;
};

export const QuizResults = ({
  feedback,
  isGenerating,
  onResetQuiz,
  onGenerateNewQuiz,
}: QuizResultsProps) => {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Score Card */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-700 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 p-6 shadow-lg">
              <Trophy className="size-12 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {feedback.score}%
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300">
              {feedback.correctAnswers} out of {feedback.totalQuestions} correct
            </p>
          </CardHeader>
        </Card>

        {/* Overall Assessment */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30">
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              {feedback.overallFeedback}
            </p>
          </CardContent>
        </Card>

        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="size-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {feedback.areasForImprovement.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Target className="size-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {area}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30">
            <CardTitle className="text-slate-700 dark:text-slate-300">
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
                        'rounded-full p-1 mt-1 shadow-sm',
                        result.isCorrect
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
                      )}
                    >
                      {result.isCorrect ? (
                        <CheckCircle className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {result.question}
                      </p>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          Your answer:{' '}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {result.selectedAnswer}
                          </span>
                        </p>
                        <p>
                          Correct answer:{' '}
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {result.correctAnswer}
                          </span>
                        </p>
                        {result.explanation && (
                          <p className="mt-1 italic text-slate-600 dark:text-slate-400">
                            {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < feedback.results.length - 1 && (
                    <Separator className="bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onResetQuiz}
            className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>
          <Button
            onClick={onGenerateNewQuiz}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Play className="mr-2 size-4" />
            )}
            New Quiz
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
