'use client';

import { Card, CardContent } from '@/components/ui/card';
import { QuizzWelcomeScreen } from './quizz-welcome-screen';
import { QuizProgress } from './quiz-progress';
import { QuestionCard } from './question-card';
import { QuizNavigation } from './quiz-navigation';
import { QuizResults } from './quiz-results';
import { useQuiz } from '../hooks/use-quiz';

type QuizzTabProps = {
  videoId: string;
  videoTitle?: string;
  videoDescription?: string;
};

export const QuizzTab = ({
  videoId,
  videoTitle,
  videoDescription,
}: QuizzTabProps) => {
  const {
    questions,
    answers,
    currentQuestion,
    currentAnswer,
    currentQuestionIndex,
    showResults,
    feedback,
    settings,
    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,
    isGenerating,
    isEvaluating,
    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    updateSettings,
    formattedTime,
  } = useQuiz(videoId);

  const handleGenerateQuestions = async () => {
    await generateQuestions(videoTitle, videoDescription);
  };

  const handleSubmitQuiz = async () => {
    await submitQuiz(videoTitle, videoDescription);
  };

  const handleAnswerSelect = (selectedAnswer: 'A' | 'B' | 'C' | 'D') => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, selectedAnswer);
    }
  };

  const renderContent = () => {
    if (showResults && feedback) {
      return (
        <QuizResults
          feedback={feedback}
          isGenerating={isGenerating}
          onResetQuiz={resetQuiz}
        />
      );
    }

    if (questions.length === 0) {
      return (
        <QuizzWelcomeScreen
          isGenerating={isGenerating}
          settings={settings}
          onGenerateQuestions={handleGenerateQuestions}
          onUpdateSettings={updateSettings}
        />
      );
    }

    if (currentQuestion) {
      return (
        <div className="space-y-6">
          <QuizProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
            progress={progress}
            questions={questions}
            answers={answers}
          />

          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuizNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            currentAnswer={currentAnswer}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            hasAnsweredAll={hasAnsweredAll}
            isEvaluating={isEvaluating}
            questions={questions}
            answers={answers}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onGoToQuestion={goToQuestion}
            onSubmitQuiz={handleSubmitQuiz}
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
