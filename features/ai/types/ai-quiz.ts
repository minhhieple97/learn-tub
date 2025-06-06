export type QuizQuestion = {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type UserAnswer = {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
};

export type QuizResult = {
  questionId: string;
  question: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type QuizFeedback = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  results: QuizResult[];
  overallFeedback: string;
  areasForImprovement: string[];
  strengths: string[];
  performanceByTopic: Record<
    string,
    {
      correct: number;
      total: number;
      percentage: number;
    }
  >;
};

export type GenerateQuestionsRequest = {
  videoId: string;
  videoTitle?: string;
  videoDescription?: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  topics?: string[];
  provider: string;
  model: string;
};

export type EvaluateQuizRequest = {
  videoId: string;
  questions: QuizQuestion[];
  answers: UserAnswer[];
  videoContext?: {
    title?: string;
    description?: string;
  };
  provider: string;
  model: string;
};

export type QuizGenerationResponse = {
  success: boolean;
  questions?: QuizQuestion[];
  error?: string;
};

export type QuizStreamChunk = {
  type: 'question' | 'complete' | 'error';
  content: string;
  finished: boolean;
};

export type QuizEvaluationResponse = {
  success: boolean;
  feedback?: QuizFeedback;
  error?: string;
};

export type QuizSettings = {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  provider: string;
  model: string;
};

export type QuizState = {
  questions: QuizQuestion[];
  answers: UserAnswer[];
  currentQuestionIndex: number;
  showResults: boolean;
  feedback: QuizFeedback | null;
  isGenerating: boolean;
  isEvaluating: boolean;
  settings: QuizSettings;
};
