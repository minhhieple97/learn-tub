"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target, Zap } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import { AIAssistantHeader } from './AIAssistantHeader';
import { AnalysisTab } from './tabs/AnalysisTab';
import { QuizTab } from './tabs/QuizTab';
import { StudyPlanTab } from './tabs/StudyPlanTab';

interface AIAssistantProps {
  videoId: string;
  dbVideoId: string;
}

export function AIAssistant({ videoId, dbVideoId }: AIAssistantProps) {
  const {
    isLoading,
    analysis,
    quiz,
    studyPlan,
    quizAnswers,
    quizSubmitted,
    quizScore,
    difficulty,
    learningGoals,
    setDifficulty,
    setLearningGoals,
    handleAnalyzeNotes,
    handleGenerateQuiz,
    handleGenerateStudyPlan,
    handleQuizSubmit,
    setQuizAnswer,
    getScoreColor,
  } = useAIAssistant(dbVideoId);

  return (
    <div className="w-full space-y-8 max-w-4xl mx-auto">
      <AIAssistantHeader />

      <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl">
        <CardContent className="p-0">
          <Tabs defaultValue="analysis" className="w-full">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100">
              <TabsList className="grid w-full grid-cols-3 bg-slate-50/80 p-1 rounded-2xl h-14">
                <TabsTrigger
                  value="analysis"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all duration-200 font-medium text-slate-600 flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Analysis</span>
                  <span className="sm:hidden">Notes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all duration-200 font-medium text-slate-600 flex items-center justify-center"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quiz
                </TabsTrigger>
                <TabsTrigger
                  value="study-plan"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all duration-200 font-medium text-slate-600 flex items-center justify-center"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Study Plan</span>
                  <span className="sm:hidden">Plan</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent
                value="analysis"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <AnalysisTab
                  isLoading={isLoading}
                  analysis={analysis}
                  handleAnalyzeNotes={handleAnalyzeNotes}
                  getScoreColor={getScoreColor}
                />
              </TabsContent>

              <TabsContent
                value="quiz"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
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
              </TabsContent>

              <TabsContent
                value="study-plan"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <StudyPlanTab
                  isLoading={isLoading}
                  studyPlan={studyPlan}
                  learningGoals={learningGoals}
                  setLearningGoals={setLearningGoals}
                  handleGenerateStudyPlan={handleGenerateStudyPlan}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
