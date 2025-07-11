"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QuizzContent } from "./quiz-content/quizz-content";

export const QuizzTab = () => {
  return (
    <div className="w-full space-y-6">
      <Card className="w-full border-slate-200 dark:border-slate-700 shadow-lg">
        <CardContent className="p-6">
          <QuizzContent />
        </CardContent>
      </Card>
    </div>
  );
};
