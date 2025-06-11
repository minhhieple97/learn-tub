import { AI_FORMAT } from '@/config/constants';
import { Json } from '@/database.types';
import { AIProvider, IFeedback } from '@/types';

export type IQuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuizSettingsType = {
  questionCount: number;
  difficulty: IQuizDifficulty;
  provider: AIProvider;
};

export type IQuestion = {
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

export type IAnswer = {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
};

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
  difficulty?: IQuizDifficulty;
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
  difficulty: IQuizDifficulty;
  provider: AIProvider;
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

export type AIEvaluationResult = {
  id: string;
  note_id: string;
  user_id: string;
  provider: AIProvider;
  model: string;
  feedback: Json;
  created_at: string;
};

export type CreateAIEvaluationInput = {
  noteId: string;
  provider: AIProvider;
  model: string;
};

export type CopyFeedbackInput = {
  feedback: IFeedback;
  format: typeof AI_FORMAT.COPY_FORMATS.PLAIN | typeof AI_FORMAT.COPY_FORMATS.MARKDOWN;
};

export type VideoWithNotes = {
  id: string;
  title: string;
  youtube_id: string;
  notes: Array<{ content: string }>;
};

export type VideoInfo = {
  id: string;
  title: string;
  youtube_id?: string;
};

export type UserNote = {
  content: string;
};

export type QuizSession = {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  difficulty: IQuizDifficulty;
  question_count: number;
  topics: string[] | null;
  ai_provider: string;
  ai_model: string;
  questions: Json;
  created_at: string | null;
  updated_at: string | null;
};

export type QuizAttempt = {
  id: string;
  quiz_session_id: string;
  user_id: string;
  answers: Json; // Use Json type to match database
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback?: Json | null; // Use Json type to match database
  time_taken_seconds?: number | null;
  completed_at: string | null; // Allow null to match database
  created_at: string | null; // Allow null to match database
};

export type QuizSessionWithAttempts = QuizSession & {
  attempts: QuizAttempt[];
  latest_attempt?: QuizAttempt;
  best_score?: number;
  attempt_count: number;
  videos?: {
    title: string;
    youtube_id: string;
    description: string;
  };
};

// Add these types for database compatibility
export type DatabaseQuizSession = {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  difficulty: string; // Database stores as string
  question_count: number;
  topics: string[] | null;
  ai_provider: string;
  ai_model: string;
  questions: Json;
  created_at: string | null;
  updated_at: string | null;
};

export type DatabaseQuizAttempt = {
  id: string;
  quiz_session_id: string;
  user_id: string;
  answers: Json; // Database stores as Json
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback?: Json | null;
  time_taken_seconds?: number | null;
  completed_at: string | null;
  created_at: string | null;
};
