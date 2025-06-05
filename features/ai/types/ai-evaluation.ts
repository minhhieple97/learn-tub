import { AI_PROVIDERS, AI_CHUNK_TYPES, AI_STATUS, AI_FORMAT } from '@/config/constants';

export type AIProvider = typeof AI_PROVIDERS.OPENAI | typeof AI_PROVIDERS.GEMINI;

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
    timestamp?: number;
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
  format: typeof AI_FORMAT.COPY_FORMATS.PLAIN | typeof AI_FORMAT.COPY_FORMATS.MARKDOWN;
};

export type AIEvaluationStatus =
  | typeof AI_STATUS.IDLE
  | typeof AI_STATUS.EVALUATING
  | typeof AI_STATUS.STREAMING
  | typeof AI_STATUS.COMPLETED
  | typeof AI_STATUS.ERROR;
