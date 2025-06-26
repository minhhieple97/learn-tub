import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";
import Link from "next/link";
import { QuizRetakeButton } from "./quiz-detail/quiz-retake-button";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { routes } from "@/routes";
import { IQuizSessionWithAttempts } from "@/features/quizzes/types";

type IQuizSessionCardProps = {
  session: IQuizSessionWithAttempts;
  onRetake: (sessionId: string) => void;
  isRetaking: boolean;
};

const QuizSessionCardComponent = ({ session }: IQuizSessionCardProps) => {
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Card className="border-border/50 bg-card hover:bg-accent/5 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground leading-tight">
              {session.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {session.videos?.title || "Video not found"}
            </CardDescription>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Created{" "}
              {session.created_at &&
                formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={session.difficulty} />
            <Badge
              variant="outline"
              className="border-border/60 text-foreground bg-background/50"
            >
              {session.question_count} questions
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-card-foreground flex-wrap">
              <span className="font-medium">
                Attempts:{" "}
                <strong className="text-foreground">
                  {session.attempt_count}
                </strong>
              </span>
              {session.best_score !== undefined && (
                <span className="font-medium">
                  Best Score:{" "}
                  <strong className="text-foreground">
                    {session.best_score}%
                  </strong>
                </span>
              )}
              {session.latest_attempt &&
                session.latest_attempt.completed_at && (
                  <span className="font-medium text-muted-foreground">
                    Last Attempt:{" "}
                    {formatDistanceToNow(
                      new Date(session.latest_attempt.completed_at),
                      {
                        addSuffix: true,
                      },
                    )}
                  </span>
                )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={routes.dashboard.quizz(session.id)}>
                <Button variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </Link>
              <QuizRetakeButton quizSessionId={session.id}></QuizRetakeButton>
            </div>
          </div>

          {session.attempts.length > 0 && (
            <div className="space-y-3">
              <Separator className="bg-border/60" />
              <h4 className="text-sm font-semibold text-card-foreground">
                Recent Attempts
              </h4>
              <div className="space-y-2">
                {session.attempts.slice(0, 3).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-muted/40 dark:bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Badge
                        variant={getScoreBadgeVariant(attempt.score)}
                        className="font-medium"
                      >
                        {attempt.score}%
                      </Badge>
                      <span className="text-foreground font-medium">
                        {attempt.correct_answers}/{attempt.total_questions}{" "}
                        correct
                      </span>
                      {attempt.time_taken_seconds && (
                        <span className="text-muted-foreground">
                          {Math.floor(attempt.time_taken_seconds / 60)}m{" "}
                          {attempt.time_taken_seconds % 60}s
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {attempt.completed_at &&
                        formatDistanceToNow(new Date(attempt.completed_at), {
                          addSuffix: true,
                        })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuizSessionCard = memo(QuizSessionCardComponent);
