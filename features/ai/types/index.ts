export type * from './ai-evaluation';
export type * from './ai-quiz';

export type QuizSettingsType = {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  provider: string;
};

export type Question = {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type Answer = {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
};

export type QuizResult = {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
};

export type QuizFeedback = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  results: QuizResult[];
};
