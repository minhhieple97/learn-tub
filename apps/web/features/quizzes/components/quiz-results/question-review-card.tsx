"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IQuizResult } from "../../types";
import { QuestionItem } from "./question-item";

type QuestionReviewCardProps = {
  results: IQuizResult[];
};

export const QuestionReviewCard = ({ results }: QuestionReviewCardProps) => {
  return (
    <Card className="border-slate-300 dark:border-slate-600">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800/50 dark:to-blue-900/50">
        <CardTitle className="text-slate-800 dark:text-slate-300">
          Question Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={result.questionId} className="space-y-2">
              <QuestionItem result={result} />
              {index < results.length - 1 && (
                <Separator className="bg-slate-300 dark:bg-slate-600" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
