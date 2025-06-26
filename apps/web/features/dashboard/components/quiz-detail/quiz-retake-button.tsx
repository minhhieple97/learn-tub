"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { routes } from "@/routes";

type QuizRetakeButtonProps = {
  quizSessionId: string;
};

export const QuizRetakeButton = ({ quizSessionId }: QuizRetakeButtonProps) => {
  const router = useRouter();

  const handleRetake = () => {
    router.push(routes.dashboard.quizRetake(quizSessionId));
  };

  return (
    <Button
      onClick={handleRetake}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <RotateCcw className="size-4" />
      Retake Quiz
    </Button>
  );
};
