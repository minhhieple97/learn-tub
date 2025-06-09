'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizProgress } from './quiz-progress';
import { QuestionCard } from './question-card';
import { QuizNavigation } from './quiz-navigation';
import { QuizResults } from './quiz-results';

import { routes } from '@/routes';
import { useQuizRetake } from '../hooks/use-quiz-retake';
import { QuizSessionWithAttempts } from '../types';

type QuizRetakeContentProps = {
  quizSession: QuizSessionWithAttempts;
};

export const QuizRetakeContent = ({ quizSession }: QuizRetakeContentProps) => {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const {
    questions,
    answers,
    currentQuestionIndex,
    showResults,
    feedback,
    formattedTime,
    currentQuestion,
    currentAnswer,
    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,
    isEvaluating,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    startTimer,
  } = useQuizRetake(quizSession.video_id, quizSession);

  const handleStartRetake = () => {
    setHasStarted(true);
    startTimer();
  };

  const handleBackToDashboard = () => {
    router.push(routes.dashboard.quizzes);
  };

  const handleSubmitQuiz = async () => {
    await submitQuiz(
      quizSession.videos?.title,
      quizSession.videos?.description,
    );
  };

  const handleResetQuiz = () => {
    resetQuiz();
    setHasStarted(false);
  };

  if (showResults && feedback) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Quiz Retake Results
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {quizSession.videos?.title}
            </p>
          </CardHeader>
          <CardContent>
            <QuizResults
              feedback={feedback}
              isGenerating={false}
              onResetQuiz={handleResetQuiz}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-fit rounded-full bg-blue-100 dark:bg-blue-900/50 p-6">
              <RotateCcw className="size-12 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Retake Quiz</CardTitle>
            <p className="text-muted-foreground">{quizSession.videos?.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="font-semibold text-lg">{questions.length}</div>
                <div className="text-muted-foreground">Questions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="font-semibold text-lg capitalize">
                  {quizSession.difficulty}
                </div>
                <div className="text-muted-foreground">Difficulty</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You're about to retake this quiz. Your previous answers will be
                cleared and you'll start fresh.
              </p>
              <Button
                onClick={handleStartRetake}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                Start Retake
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-semibold">Quiz Retake</h1>
          <p className="text-sm text-muted-foreground">
            {quizSession.videos?.title}
          </p>
        </div>
        <div className="w-24" />
      </div>

      <QuizProgress
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        progress={progress}
        questions={questions}
        answers={answers}
      />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          currentAnswer={currentAnswer}
          onAnswerSelect={(answer) =>
            answerQuestion(currentQuestion.id, answer)
          }
        />
      )}

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
        formattedTime={formattedTime}
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        onGoToQuestion={goToQuestion}
        onSubmitQuiz={handleSubmitQuiz}
      />
    </div>
  );
};
