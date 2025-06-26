"use client";

import { Brain } from "lucide-react";
import { Suspense } from "react";
import { useAction } from "next-safe-action/hooks";
import { retakeQuizAction } from "../actions/quiz-actions";
import { QuizDashboardStats } from "./quiz-dashboard-stats";
import { QuizDashboardFilters } from "./quiz-dashboard-filters";
import { QuizSessionsList } from "./quiz-sessions-list";
import { QuizSessionsSkeleton } from "./quiz-sessions-skeleton";
import { QuizPagination } from "./quiz-pagination";
import type { IQuizSessionWithAttempts } from "@/features/quizzes/types";

type Video = {
  id: string;
  title: string;
  youtube_id: string;
};

type QuizDashboardProps = {
  data: {
    sessions: IQuizSessionWithAttempts[];
    totalSessions: number;
    totalAttempts: number;
    averageScore: number;
    totalPages: number;
    currentPage: number;
  };
  videos: Video[];
};

export const QuizDashboard = ({ data, videos }: QuizDashboardProps) => {
  const { execute: executeRetake, isExecuting: isRetaking } =
    useAction(retakeQuizAction);

  const handleRetakeQuiz = async (sessionId: string) => {
    executeRetake({ sessionId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Brain className="h-6 w-6" />
            Quiz Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your quiz history and track your learning progress
          </p>
        </div>
      </div>

      <QuizDashboardStats
        totalSessions={data.totalSessions}
        totalAttempts={data.totalAttempts}
        averageScore={data.averageScore}
      />

      <QuizDashboardFilters videos={videos} />

      <Suspense fallback={<QuizSessionsSkeleton />}>
        <QuizSessionsList
          sessions={data.sessions}
          onRetake={handleRetakeQuiz}
          isRetaking={isRetaking}
        />
      </Suspense>

      {data.sessions.length > 0 && (
        <QuizPagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalSessions}
          itemsPerPage={10}
        />
      )}
    </div>
  );
};
