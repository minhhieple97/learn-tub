"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { IQuizSessionWithAttempts } from "@/features/quizzes/types";

type IQuizHeaderProps = {
  quizSession: IQuizSessionWithAttempts;
};

export const QuizHeader = ({ quizSession }: IQuizHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Link href={routes.dashboard.quizzes}>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Button>
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {quizSession.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {quizSession.videos?.title || "Video not found"}
        </p>
      </div>
    </div>
  );
};
