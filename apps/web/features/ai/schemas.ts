import { z } from "zod";

const commandValues = [
  "evaluate_note",
  "generate_quizz_questions",
  "evaluate_quizz_answers",
] as const;

export const IAICommandSchema = z.enum(commandValues);

export const IAIUsageStatusSchema = z.enum(["success", "error"]);

export const ITokenUsageSchema = z.object({
  input_tokens: z.number().min(0),
  output_tokens: z.number().min(0),
  total_tokens: z.number().min(0),
});

export const ICostDetailsSchema = z.object({
  input_cost_per_token: z.number().min(0),
  output_cost_per_token: z.number().min(0),
  total_cost_usd: z.number().min(0),
});

export const ITrackAIUsageRequestSchema = z.object({
  user_id: z.string().uuid(),
  command: IAICommandSchema,
  provider_id: z.string().uuid(),
  status: IAIUsageStatusSchema,
  tokens_used: z.number().min(0).optional(),
  input_tokens: z.number().min(0).optional(),
  output_tokens: z.number().min(0).optional(),
  cost_usd: z.number().min(0).optional(),
  request_duration_ms: z.number().min(0).optional(),
  error_message: z.string().optional(),
  request_payload: z.record(z.unknown()).optional(),
  response_payload: z.record(z.unknown()).optional(),
});

export const IAIUsageTimeRangeSchema = z.enum(["day", "week", "month", "year"]);

export const IAIUsageFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  model: z.string().optional(),
  command: IAICommandSchema.optional(),
  status: IAIUsageStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

export const ICreateAIUsageLogSchema = z.object({
  user_id: z.string().uuid(),
  command: IAICommandSchema,
  model: z.string().min(1),
  status: IAIUsageStatusSchema,
  tokens_used: z.number().min(0).optional(),
  input_tokens: z.number().min(0).optional(),
  output_tokens: z.number().min(0).optional(),
  cost_usd: z.number().min(0).optional(),
  request_duration_ms: z.number().min(0).optional(),
  error_message: z.string().optional(),
  request_payload: z.record(z.unknown()).optional(),
  response_payload: z.record(z.unknown()).optional(),
});

export const IUpdateAIUsageLogSchema = ICreateAIUsageLogSchema.partial().extend(
  {
    id: z.string().uuid(),
  },
);

export const IAnalyticsQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  time_range: IAIUsageTimeRangeSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  model: z.string().optional(),
  command: IAICommandSchema.optional(),
});
