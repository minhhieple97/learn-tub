"use client";

import { useQuizStore } from "../../store";
import { QuizzWelcomeScreen } from "../quizz-welcome-screen";
import { QuizzResults } from "../quizz-results";
import { QuizzQuestionView } from "./quizz-question-view";

export const QuizzContent = () => {
  const { questions, feedback, showResults } = useQuizStore();

  if (showResults && feedback) {
    return <QuizzResults />;
  }

  if (questions.length === 0) {
    return <QuizzWelcomeScreen />;
  }

  if (questions.length > 0 && !showResults) {
    return <QuizzQuestionView />;
  }

  return null;
};
