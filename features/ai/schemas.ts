import { z } from 'zod';
import { AI_PROVIDERS } from '@/config/constants';

export const AIProviderSchema = z.enum([AI_PROVIDERS.OPENAI, AI_PROVIDERS.GEMINI]);

export const AIFeedbackSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  correct_points: z.array(z.string()),
  incorrect_points: z.array(z.string()),
  improvement_suggestions: z.array(z.string()),
  overall_score: z.number().min(1).max(10),
  detailed_analysis: z.string().min(1, 'Detailed analysis is required'),
});

export const CreateAIEvaluationSchema = z.object({
  noteId: z.string().uuid('Invalid note ID'),
  provider: AIProviderSchema,
  model: z.string().min(1, 'Model is required'),
});

export const CopyFeedbackSchema = z.object({
  feedback: AIFeedbackSchema,
  format: z.enum(['plain', 'markdown']),
});

export const AIEvaluationSettingsSchema = z.object({
  provider: AIProviderSchema,
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(100).max(4000).default(1500),
});

export const AnalyzeNotesSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
});

export const GenerateQuizSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const GenerateStudyPlanSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  learningGoals: z
    .array(z.string().min(1, 'Learning goal cannot be empty'))
    .min(1, 'At least one learning goal is required'),
});

export const GetNoteFeedbackSchema = z.object({
  noteContent: z
    .string()
    .min(1, 'Note content cannot be empty')
    .max(1000, 'Note content cannot exceed 1000 characters'),
  timestamp: z.number().min(0, 'Timestamp must be non-negative'),
});
