import { AI_FORMAT } from '@/config/constants';
import { Json } from '@/database.types';
import { IFeedback, IApiResponse } from '@/types';

export type IQuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type IQuizAnswerOption = 'A' | 'B' | 'C' | 'D';
export type IQuizDifficultyFilter = 'all' | IQuizDifficulty;

export type IQuizSettingsType = {
  questionCount: number;
  difficulty: IQuizDifficulty;
  aiModelId: string;
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
  correctAnswer: IQuizAnswerOption;
  topic: string;
  difficulty: IQuizDifficulty;
};

export type IAnswer = {
  questionId: string;
  selectedAnswer: IQuizAnswerOption;
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
  correctAnswer: IQuizAnswerOption;
  explanation: string;
  topic: string;
  difficulty: IQuizDifficulty;
};

export type IUserAnswer = {
  questionId: string;
  selectedAnswer: IQuizAnswerOption;
};

export type IQuizResult = {
  questionId: string;
  question: string;
  selectedAnswer: IQuizAnswerOption;
  correctAnswer: IQuizAnswerOption;
  isCorrect: boolean;
  explanation: string;
  topic: string;
  difficulty: IQuizDifficulty;
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
  aiModelId: string;
  userId: string;
};

export type IEvaluateQuizRequest = {
  aiModelId: string;
  questions: IQuizQuestion[];
  answers: Array<{ questionId: string; selectedAnswer: 'A' | 'B' | 'C' | 'D' }>;
  videoContext?: {
    title?: string;
    description?: string;
    tutorial?: string;
  };
  userId: string;
};

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
  aiModelId: string;
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
  provider: string | null;
  model: string;
  feedback: Json;
  created_at: string;
};

export type ICreateAIEvaluationInput = {
  noteId: string;
  provider: string | null;
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
  ai_model_id: string | null;
  questions: Json;
  created_at: string | null;
  updated_at: string | null;
  model_name?: string;
  provider_name?: string;
  provider_display_name?: string;
};

export type IQuizAttempt = {
  id: string;
  quiz_session_id: string;
  user_id: string;
  answers: Json;
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback?: Json | null;
  time_taken_seconds?: number | null;
  completed_at: string | null;
  created_at: string | null;
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

export type IDatabaseQuizSession = {
  user_id: string;
  video_id: string;
  title: string;
  difficulty: string;
  question_count: number;
  topics: string[] | null;
  ai_model_id: string;
  questions: Json;
  created_at: string | null;
  updated_at: string | null;
};

export type IDatabaseQuizAttempt = {
  id: string;
  quiz_session_id: string;
  user_id: string;
  answers: Json;
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback?: Json | null;
  time_taken_seconds?: number | null;
  completed_at: string | null;
  created_at: string | null;
};
