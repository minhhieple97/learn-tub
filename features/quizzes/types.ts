import { AI_FORMAT } from '@/config/constants';
import { Json } from '@/database.types';
import { AIProvider, IFeedback, IApiResponse, IAsyncOperationHook } from '@/types';

export type IQuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type IQuizDifficultyFilter = 'all' | IQuizDifficulty;

export type IQuizSettingsType = {
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

export type IQuizQuestion = {
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

export type IUserAnswer = {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
};

export type IQuizResult = {
  questionId: string;
  question: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type IQuizFeedback = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  results: IQuizResult[];
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

export type IGenerateQuestionsRequest = {
  videoId: string;
  videoTitle?: string;
  videoDescription?: string;
  videoTutorial?: string;
  questionCount?: number;
  difficulty?: IQuizDifficulty;
  topics?: string[];
  provider: string;
  model: string;
};

export type IEvaluateQuizRequest = {
  videoId: string;
  questions: IQuizQuestion[];
  answers: IUserAnswer[];
  videoContext?: {
    title?: string;
    description?: string;
    tutorial?: string;
  };
  provider: string;
  model: string;
};

// Use common generic response types
export type IQuizGenerationResponse = IApiResponse<IQuizQuestion[]>;
export type IQuizEvaluationResponse = IApiResponse<IQuizFeedback>;

export type IQuizStreamChunk = {
  type: 'question' | 'complete' | 'error';
  content: string;
  finished: boolean;
};

export type IQuizSettings = {
  questionCount: number;
  difficulty: IQuizDifficulty;
  provider: AIProvider;
  model: string;
};

export type IQuizState = {
  questions: IQuizQuestion[];
  answers: IUserAnswer[];
  currentQuestionIndex: number;
  showResults: boolean;
  feedback: IQuizFeedback | null;
  isGenerating: boolean;
  isEvaluating: boolean;
  settings: IQuizSettings;
};

export type INoteEvaluationResult = {
  id: string;
  note_id: string;
  user_id: string;
  provider: AIProvider;
  model: string;
  feedback: Json;
  created_at: string;
};

export type ICreateAIEvaluationInput = {
  noteId: string;
  provider: AIProvider;
  model: string;
};

export type ICopyFeedbackInput = {
  feedback: IFeedback;
  format: typeof AI_FORMAT.COPY_FORMATS.PLAIN | typeof AI_FORMAT.COPY_FORMATS.MARKDOWN;
};

export type IVideoWithNotes = {
  id: string;
  title: string;
  youtube_id: string;
  notes: Array<{ content: string }>;
};

export type IVideoInfo = {
  id: string;
  title: string;
  youtube_id?: string;
};

export type IUserNote = {
  content: string;
};

export type IQuizSession = {
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

export type IQuizAttempt = {
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

export type IQuizSessionWithAttempts = IQuizSession & {
  attempts: IQuizAttempt[];
  latest_attempt?: IQuizAttempt;
  best_score?: number;
  attempt_count: number;
  videos?: {
    title: string;
    youtube_id: string;
    description: string;
  };
};

// Add these types for database compatibility
export type IDatabaseQuizSession = {
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

export type IDatabaseQuizAttempt = {
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
