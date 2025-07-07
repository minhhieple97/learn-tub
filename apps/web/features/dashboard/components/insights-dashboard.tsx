"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, TrendingUp, Zap, Trophy, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { routes } from "@/routes";
import type { IInsightsData } from "../types";

type InsightsDashboardProps = {
  data: IInsightsData;
};

export const InsightsDashboard = ({ data }: InsightsDashboardProps) => {
  const { analysisCount, quizStats } = data;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Brain className="h-5 w-5" />
        AI Learning Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Analyses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisCount}</div>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </CardContent>
        </Card>

        <Link href={routes.dashboard.quizzes}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quizzes Generated
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizStats.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Practice assessments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">Total completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Quiz Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Performance rating</p>
          </CardContent>
        </Card>
      </div>

      {quizStats.recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Quiz Results</CardTitle>
            <CardDescription>
              Your latest quiz performance and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizStats.recentAttempts.map((attempt: any) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {attempt.quiz_sessions.videos.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {attempt.quiz_sessions.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(attempt.completed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {attempt.correct_answers}/{attempt.total_questions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        correct
                      </div>
                    </div>
                    <Badge
                      variant={
                        attempt.score >= 80
                          ? "default"
                          : attempt.score >= 60
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {attempt.score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {quizStats.totalSessions === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Get Started with AI Quizzes
            </CardTitle>
            <CardDescription>
              Generate your first quiz from any video to start tracking your
              learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Visit any video page and click "Generate Quiz" to create your
                first practice assessment
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
