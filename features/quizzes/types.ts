import {
  AI_PROVIDERS,
  AI_CHUNK_TYPES,
  AI_STATUS,
  AI_FORMAT,
} from '@/config/constants';
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

export type AIProvider =
  | typeof AI_PROVIDERS.OPENAI
  | typeof AI_PROVIDERS.GEMINI;

export type AIEvaluationResult = {
  id: string;
  note_id: string;
  user_id: string;
  provider: AIProvider;
  model: string;
  feedback: AIFeedback;
  created_at: string;
};

export type AIFeedback = {
  summary: string;
  correct_points: string[];
  incorrect_points: string[];
  improvement_suggestions: string[];
  overall_score: number; // 1-10
  detailed_analysis: string;
};

export type AIEvaluationRequest = {
  noteId: string;
  content: string;
  provider: AIProvider;
  model: string;
  context?: {
    videoTitle?: string;
    videoDescription?: string;
    timestamp: number | null;
  };
};

export type AIEvaluationResponse = {
  success: boolean;
  data?: AIEvaluationResult;
  error?: string;
};

export type AIStreamChunk = {
  type:
    | typeof AI_CHUNK_TYPES.FEEDBACK
    | typeof AI_CHUNK_TYPES.COMPLETE
    | typeof AI_CHUNK_TYPES.ERROR;
  content: string;
  finished?: boolean;
};

export type AIEvaluationSettings = {
  provider: AIProvider;
  model: string;
  temperature: number;
  max_tokens: number;
};

export type CreateAIEvaluationInput = {
  noteId: string;
  provider: AIProvider;
  model: string;
};

export type CopyFeedbackInput = {
  feedback: AIFeedback;
  format:
    | typeof AI_FORMAT.COPY_FORMATS.PLAIN
    | typeof AI_FORMAT.COPY_FORMATS.MARKDOWN;
};

export type AIEvaluationStatus =
  | typeof AI_STATUS.IDLE
  | typeof AI_STATUS.EVALUATING
  | typeof AI_STATUS.STREAMING
  | typeof AI_STATUS.COMPLETED
  | typeof AI_STATUS.ERROR;

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
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  question_count: number;
  topics: string[];
  ai_provider: string;
  ai_model: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
};

export type QuizAttempt = {
  id: string;
  quiz_session_id: string;
  user_id: string;
  answers: UserAnswer[];
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback?: QuizFeedback;
  time_taken_seconds?: number;
  completed_at: string;
  created_at: string;
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
