'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizHeader } from './quiz-detail/quiz-header';
import { QuizInfoCard } from './quiz-detail/quiz-info-card';
import { QuestionItem } from './quiz-detail/question-item';
import { AttemptHistory } from './quiz-detail/attempt-history';
import { IQuizQuestion, IQuizSessionWithAttempts } from '@/features/quizzes/types';

type IQuizDetailContentProps = {
  quizSession: IQuizSessionWithAttempts;
};

export const QuizDetailContent = ({ quizSession }: IQuizDetailContentProps) => {
  return (
    <div className="space-y-8">
      <QuizHeader quizSession={quizSession} />

      <QuizInfoCard quizSession={quizSession} />

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Questions & Answers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {((quizSession.questions as IQuizQuestion[]) ?? []).map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                isLast={index === ((quizSession.questions as IQuizQuestion[]) ?? []).length - 1}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <AttemptHistory attempts={quizSession.attempts} />
    </div>
  );
};
