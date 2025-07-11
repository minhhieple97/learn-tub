"use client";

import { useQuizStore } from "../../store";
import { QuizzProgress } from "../quizz-progress";
import { QuestionCard } from "../question-card";
import { QuizzNavigation } from "../quizz-navigation";
import { IQuizAnswerOption } from "../../types";

export const QuizzQuestionView = () => {
  const { getCurrentQuestion, getCurrentAnswer, answerQuestion } =
    useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();

  const handleAnswerSelect = (selectedAnswer: IQuizAnswerOption) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, selectedAnswer);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <QuizzProgress />

      <QuestionCard
        question={currentQuestion}
        currentAnswer={currentAnswer ?? undefined}
        onAnswerSelect={handleAnswerSelect}
      />

      <QuizzNavigation />
    </div>
  );
};
