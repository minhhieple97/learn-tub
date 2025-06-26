import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
  timestamp_seconds: z.number().min(0),
  tags: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
  video_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export const createNotePayloadSchema = z.object({
  video_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
  timestamp_seconds: z.number().min(0),
  tags: z.array(z.string()).default([]),
});

export const updateNotePayloadSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  updated_at: z.string(),
});

export const noteEditorPropsSchema = z.object({
  videoId: z.string().min(1),
  currentTimestamp: z.number().min(0),
  onTimestampClick: z.function().args(z.number()).returns(z.void()).optional(),
});

export const saveNoteInputSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content is too long"),
  timestamp: z.number().min(0, "Timestamp must be positive"),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
});

export const updateNoteInputSchema = z.object({
  noteId: z.string().uuid("Invalid note ID"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content is too long"),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
});

export const deleteNoteInputSchema = z.object({
  noteId: z.string().uuid("Invalid note ID"),
});

export const EvaluateNoteQuerySchema = z.object({
  noteId: z.string().uuid("Invalid note ID format"),
  aiModelId: z.string().uuid("Invalid AI Model ID"),
});
