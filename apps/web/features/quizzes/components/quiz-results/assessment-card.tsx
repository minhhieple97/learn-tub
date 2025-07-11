"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

type AssessmentCardProps = {
  overallFeedback: string;
};

export const AssessmentCard = ({ overallFeedback }: AssessmentCardProps) => {
  return (
    <Card className="border-slate-300 dark:border-slate-600">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800/50 dark:to-blue-900/50">
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-300">
          <BookOpen className="size-5 text-blue-700 dark:text-blue-300" />
          Overall Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-slate-800 dark:text-slate-300">
          {overallFeedback}
        </p>
      </CardContent>
    </Card>
  );
};
