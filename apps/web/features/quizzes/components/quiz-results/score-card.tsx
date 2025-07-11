"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

type ScoreCardProps = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
};

export const ScoreCard = ({
  score,
  correctAnswers,
  totalQuestions,
}: ScoreCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 border-blue-300 dark:border-blue-600 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-800/50 dark:to-yellow-800/50 p-6 shadow-lg">
          <Trophy className="size-12 text-amber-700 dark:text-amber-300" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r text-pretty">
          {score}%
        </CardTitle>
        <p className="text-primary">
          {correctAnswers} out of {totalQuestions} correct
        </p>
      </CardHeader>
    </Card>
  );
};
