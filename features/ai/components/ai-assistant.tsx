'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Loader2,
} from 'lucide-react';
import { useAIQuiz } from '../hooks/use-ai-quiz';
import { cn } from '@/lib/utils';

type AIAssistantProps = {
  videoId: string;
  videoTitle?: string;
  videoDescription?: string;
};

export const AIAssistant = ({
  videoId,
  videoTitle,
  videoDescription,
}: AIAssistantProps) => {
  const [showSettings, setShowSettings] = useState(false);

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
  } = useAIQuiz(videoId);

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

  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        <Brain className="size-12 text-primary" />
      </div>
      <h2 className="mb-4 text-2xl font-bold">AI Quiz Assistant</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Test your knowledge with AI-generated questions based on this video
        content. Get personalized feedback to improve your understanding.
      </p>

      {showSettings && (
        <Card className="mb-6 w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Number of Questions</label>
              <Select
                value={settings.questionCount.toString()}
                onValueChange={(value) =>
                  updateSettings({ questionCount: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={settings.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard' | 'mixed') =>
                  updateSettings({ difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">AI Provider</label>
              <Select
                value={settings.provider}
                onValueChange={(value) => updateSettings({ provider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
        <Button
          onClick={handleGenerateQuestions}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Play className="mr-2 size-4" />
          )}
          Generate Quiz
        </Button>
      </div>
    </div>
  );

  const renderQuizQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{answeredCount} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="mb-2">
                {currentQuestion.topic}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === 'easy'
                    ? 'default'
                    : currentQuestion.difficulty === 'medium'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <Button
                  key={key}
                  variant={
                    currentAnswer?.selectedAnswer === key
                      ? 'default'
                      : 'outline'
                  }
                  className={cn(
                    'justify-start p-4 h-auto text-left whitespace-normal',
                    currentAnswer?.selectedAnswer === key &&
                      'ring-2 ring-primary',
                  )}
                  onClick={() =>
                    handleAnswerSelect(key as 'A' | 'B' | 'C' | 'D')
                  }
                >
                  <span className="mr-3 font-semibold">{key}.</span>
                  <span>{value}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-green-600">
                    {answeredCount}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(questions.length, 10) }).map(
                  (_, index) => {
                    const questionIndex = Math.floor(
                      (index * questions.length) /
                        Math.min(questions.length, 10),
                    );
                    const isAnswered = answers.some(
                      (a) => a.questionId === questions[questionIndex]?.id,
                    );
                    const isCurrent =
                      Math.abs(questionIndex - currentQuestionIndex) <=
                      questions.length / 20;

                    return (
                      <div
                        key={index}
                        className={cn(
                          'w-2 h-2 rounded-full transition-colors',
                          isAnswered
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-primary'
                            : 'bg-muted',
                        )}
                      />
                    );
                  },
                )}
              </div>
            </div>

            {/* Question Jump Selector */}
            <Select
              value={currentQuestionIndex.toString()}
              onValueChange={(value) => goToQuestion(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {questions.map((question, index) => {
                  const isAnswered = answers.some(
                    (a) => a.questionId === question.id,
                  );

                  return (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex w-full items-center gap-2">
                        <span className="font-medium">Q{index + 1}</span>
                        {isAnswered && (
                          <CheckCircle className="size-3 text-green-600" />
                        )}
                        <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                          {question.question.slice(0, 30)}...
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={!canGoPrevious}
              className="flex items-center gap-2 px-6"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {/* Center Question Info */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>{currentQuestionIndex + 1}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  {questions.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {currentAnswer ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="size-3" />
                    <span>Answered</span>
                  </div>
                ) : (
                  <span>Not answered</span>
                )}
              </div>
            </div>

            {canGoNext ? (
              <Button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-6"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!hasAnsweredAll || isEvaluating}
                className="flex items-center gap-2 bg-green-600 px-6 hover:bg-green-700"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!feedback) return null;

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-6">
                <Trophy className="size-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {feedback.score}%
              </CardTitle>
              <p className="text-muted-foreground">
                {feedback.correctAnswers} out of {feedback.totalQuestions}{' '}
                correct
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{feedback.overallFeedback}</p>
            </CardContent>
          </Card>

          {feedback.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="size-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {feedback.areasForImprovement.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Target className="size-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-orange-500" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.results.map((result, index) => (
                  <div key={result.questionId} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'rounded-full p-1 mt-1',
                          result.isCorrect
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600',
                        )}
                      >
                        {result.isCorrect ? (
                          <CheckCircle className="size-4" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{result.question}</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            Your answer:{' '}
                            <span className="font-medium">
                              {result.selectedAnswer}
                            </span>
                          </p>
                          <p>
                            Correct answer:{' '}
                            <span className="font-medium text-green-600">
                              {result.correctAnswer}
                            </span>
                          </p>
                          {result.explanation && (
                            <p className="mt-1 italic">{result.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < feedback.results.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCcw className="mr-2 size-4" />
              Try Again
            </Button>
            <Button onClick={handleGenerateQuestions} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Play className="mr-2 size-4" />
              )}
              New Quiz
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full">
        <CardContent className="p-6">
          {questions.length === 0 && !showResults && renderWelcomeScreen()}
          {questions.length > 0 && !showResults && renderQuizQuestion()}
          {showResults && renderResults()}
        </CardContent>
      </Card>
    </div>
  );
};
