'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { QuizQuestion } from '@/features/ai';

type QuestionItemProps = {
  question: QuizQuestion;
  index: number;
  isLast: boolean;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'mixed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
  }
};

export const QuestionItem = ({
  question,
  index,
  isLast,
}: QuestionItemProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Badge
            variant="outline"
            className="mt-1 flex-shrink-0 border-border bg-muted/50 text-foreground"
          >
            {index + 1}
          </Badge>
          <div className="flex-1 space-y-4">
            <h4 className="font-medium text-card-foreground leading-relaxed">
              {question.question}
            </h4>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
                className="gap-2 border-border/60 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Answers
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Answers
                  </>
                )}
              </Button>

              {showAnswers && (
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isCorrect = key === question.correctAnswer;
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border transition-colors ${
                          isCorrect
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-muted/50 dark:bg-muted/20 border-border/50 hover:bg-accent/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-card-foreground text-sm">
                              {key}.
                            </span>
                            <span className="text-card-foreground">
                              {value}
                            </span>
                          </div>
                          {isCorrect && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <Badge
                                variant="default"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                Correct
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className="border-border/60 text-foreground bg-background/50"
              >
                {question.topic}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="gap-2 border-border/60 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {showExplanation ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Explanation
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Explanation
                  </>
                )}
              </Button>

              {showExplanation && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-card-foreground leading-relaxed">
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      Explanation:
                    </span>
                    <span className="ml-2">{question.explanation}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isLast && <Separator className="my-6 bg-border/60" />}
    </div>
  );
};
