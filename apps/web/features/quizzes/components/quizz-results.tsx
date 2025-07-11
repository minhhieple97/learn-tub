"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import { useQuizStore } from "../store";
import { ScoreCard } from "./quiz-results/score-card";
import { AssessmentCard } from "./quiz-results/assessment-card";
import { StrengthsCard } from "./quiz-results/strengths-card";
import { ImprovementAreasCard } from "./quiz-results/improvement-areas-card";
import { QuestionReviewCard } from "./quiz-results/question-review-card";

export const QuizzResults = () => {
  const { feedback, resetQuiz } = useQuizStore();

  if (!feedback) return null;

  return (
    <ScrollArea
      className="h-[calc(100vh-200px)] pr-4"
      type="always"
      scrollHideDelay={0}
    >
      <div className="space-y-6">
        <ScoreCard
          score={feedback.score}
          correctAnswers={feedback.correctAnswers}
          totalQuestions={feedback.totalQuestions}
        />

        <AssessmentCard overallFeedback={feedback.overallFeedback} />

        {feedback.strengths.length > 0 && (
          <StrengthsCard strengths={feedback.strengths} />
        )}

        {feedback.areasForImprovement.length > 0 && (
          <ImprovementAreasCard areas={feedback.areasForImprovement} />
        )}

        <QuestionReviewCard results={feedback.results} />

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
