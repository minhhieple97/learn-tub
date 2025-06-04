"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, Sparkles } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import { AnalysisTab } from './tabs/AnalysisTab';
import { QuizTab } from './tabs/QuizTab';

interface AIAssistantProps {
  videoId: string;
  dbVideoId: string;
}

export const AIAssistant = ({ videoId, dbVideoId }: AIAssistantProps) => {
  const {
    isLoading,
    analysis,
    quiz,
    quizAnswers,
    quizSubmitted,
    quizScore,
    difficulty,
    setDifficulty,
    handleAnalyzeNotes,
    handleGenerateQuiz,
    handleQuizSubmit,
    setQuizAnswer,
    getScoreColor,
  } = useAIAssistant(dbVideoId);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Notes Analysis Section - Left Side */}
        <div className="space-y-4">
          <Card className="border-2 border-neutral-sage bg-neutral-pearl shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-neutral-sage text-neutral-sage p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <FileText className="h-6 w-6 mr-3" />
                Notes Analysis
              </CardTitle>
              <p className="text-neutral-sage/80 text-sm mt-2">
                Get AI-powered insights and analysis of your learning notes
              </p>
            </CardHeader>
            <CardContent className="p-6 bg-neutral-pearl">
              <AnalysisTab
                isLoading={isLoading}
                analysis={analysis}
                handleAnalyzeNotes={handleAnalyzeNotes}
                getScoreColor={getScoreColor}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quiz Section - Right Side */}
        <div className="space-y-4">
          <Card className="border-2 border-neutral-mist bg-neutral-pearl shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-neutral-mist text-neutral-mist p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <Zap className="h-6 w-6 mr-3" />
                Knowledge Quiz
              </CardTitle>
              <p className="text-neutral-mist/80 text-sm mt-2">
                Test your understanding with personalized quiz questions
              </p>
            </CardHeader>
            <CardContent className="p-6 bg-neutral-pearl">
              <QuizTab
                isLoading={isLoading}
                quiz={quiz}
                difficulty={difficulty}
                quizAnswers={quizAnswers}
                quizSubmitted={quizSubmitted}
                quizScore={quizScore}
                setDifficulty={setDifficulty}
                handleGenerateQuiz={handleGenerateQuiz}
                handleQuizSubmit={handleQuizSubmit}
                setQuizAnswer={setQuizAnswer}
                getScoreColor={getScoreColor}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
