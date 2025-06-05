import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  analyzeNotesAction,
  generateQuizAction,
  generateStudyPlanAction,
} from '../actions/ai-actions';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface NoteAnalysis {
  summary: string;
  keyPoints: string[];
  knowledgeGaps: string[];
  suggestions: string[];
  comprehensionScore: number;
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export const useAIAssistant = (videoId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [learningGoals, setLearningGoals] = useState('');
  const { toast } = useToast();

  const handleAnalyzeNotes = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeNotesAction({ videoId });
      if (result.serverError) {
        toast({
          title: 'Error',
          description: result.serverError,
          variant: 'destructive',
        });
      } else {
        setAnalysis(result.data?.analysis);
        toast({
          title: 'Analysis Complete',
          description: 'Your notes have been analyzed successfully',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to analyze notes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    try {
      const result = await generateQuizAction({ videoId, difficulty });
      if (result.serverError) {
        toast({
          title: 'Error',
          description: result.serverError,
          variant: 'destructive',
        });
      } else {
        setQuiz(result.data?.quiz);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        toast({
          title: 'Quiz Generated',
          description: 'Your personalized quiz is ready',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate quiz',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!learningGoals.trim()) {
      toast({
        title: 'Learning Goals Required',
        description: 'Please enter your learning goals first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const goals = learningGoals.split('\n').filter((goal) => goal.trim());
      const result = await generateStudyPlanAction({ videoId, learningGoals: goals });
      if (result.serverError) {
        toast({
          title: 'Error',
          description: result.serverError,
          variant: 'destructive',
        });
      } else {
        setStudyPlan(result.data?.studyPlan || null);
        toast({
          title: 'Study Plan Created',
          description: 'Your personalized study plan is ready',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate study plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;

    let correct = 0;
    for (const [index, question] of quiz.questions.entries()) {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    }

    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    toast({
      title: 'Quiz Completed',
      description: `You scored ${score}% (${correct}/${quiz.questions.length} correct)`,
      variant: score >= 70 ? 'default' : 'destructive',
    });
  };

  const setQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return {
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
  };
};
