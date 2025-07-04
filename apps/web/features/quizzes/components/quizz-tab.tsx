"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QuizzWelcomeScreen } from "./quizz-welcome-screen";
import { QuizzProgress } from "./quizz-progress";
import { QuestionCard } from "./question-card";
import { QuizzNavigation } from "./quizz-navigation";
import { QuizzResults } from "./quizz-results";
import { useQuizTab } from "../hooks/use-quiz-tab";

export const QuizzTab = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    feedback,
    isGenerating,
    isEvaluating,
    currentQuestion,
    currentAnswer,
    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,
    formattedTime,
    generateQuestions,
    handleAnswerSelect,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    quizState,
  } = useQuizTab();

  const renderContent = () => {
    if (quizState.showResults) {
      return <QuizzResults feedback={feedback!} isGenerating={isGenerating} />;
    }

    if (quizState.showWelcome) {
      return (
        <QuizzWelcomeScreen
          isGenerating={isGenerating}
          onGenerateQuestions={generateQuestions}
        />
      );
    }

    if (quizState.showQuiz && currentQuestion) {
      return (
        <div className="space-y-6">
          <QuizzProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
            progress={progress}
            questions={questions}
            answers={answers}
          />

          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer ?? undefined}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuizzNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            currentAnswer={currentAnswer ?? undefined}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            hasAnsweredAll={hasAnsweredAll}
            isEvaluating={isEvaluating}
            questions={questions}
            answers={answers}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onGoToQuestion={goToQuestion}
            onSubmitQuiz={submitQuiz}
            formattedTime={formattedTime}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full border-slate-200 dark:border-slate-700 shadow-lg">
        <CardContent className="p-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
};
