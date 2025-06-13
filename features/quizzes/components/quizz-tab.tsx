'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QuizzWelcomeScreen } from './quizz-welcome-screen';
import { QuizProgress } from './quiz-progress';
import { QuestionCard } from './question-card';
import { QuizNavigation } from './quiz-navigation';
import { QuizResults } from './quiz-results';
import { useQuizStore } from '../store';
import { IQuizAnswerOption } from '../types';

type QuizzTabProps = {
  videoId: string;
  videoTitle?: string;
  videoDescription?: string;
};

export const QuizzTab = ({ videoId, videoTitle, videoDescription }: QuizzTabProps) => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    showResults,
    feedback,
    isGenerating,
    isEvaluating,
    setVideoContext,
    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    getCurrentQuestion,
    getCurrentAnswer,
    getHasAnsweredAll,
    getCanGoNext,
    getCanGoPrevious,
    getProgress,
    getAnsweredCount,
    getFormattedTime,
  } = useQuizStore();

  // Set video context when component mounts or props change
  useEffect(() => {
    setVideoContext(videoId, videoTitle, videoDescription);
  }, [videoId, videoTitle, videoDescription, setVideoContext]);

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const hasAnsweredAll = getHasAnsweredAll();
  const canGoNext = getCanGoNext();
  const canGoPrevious = getCanGoPrevious();
  const progress = getProgress();
  const answeredCount = getAnsweredCount();
  const formattedTime = getFormattedTime();

  const handleAnswerSelect = (selectedAnswer: IQuizAnswerOption) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, selectedAnswer);
    }
  };

  const renderContent = () => {
    if (showResults && feedback) {
      return <QuizResults feedback={feedback} isGenerating={isGenerating} />;
    }

    if (questions.length === 0) {
      return (
        <QuizzWelcomeScreen isGenerating={isGenerating} onGenerateQuestions={generateQuestions} />
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
            currentAnswer={currentAnswer ?? undefined}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuizNavigation
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
