import { z } from "zod";

// Enum schemas
export const roadmapStatusSchema = z.enum([
  "draft",
  "active",
  "completed",
  "archived",
]);
export const roadmapNodeStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "skipped",
]);
export const roadmapInteractionTypeSchema = z.enum([
  "generate",
  "update",
  "search_videos",
]);
export const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export const timeCommitmentSchema = z.enum(["low", "medium", "high"]);
export const learningStyleSchema = z.enum([
  "visual",
  "practical",
  "theoretical",
]);

// Base input schemas
export const createRoadmapInputSchema = z.object({
  skill_name: z
    .string()
    .min(1, "Skill name is required")
    .max(200, "Skill name too long"),
  title: z.string().max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
});

export const updateRoadmapInputSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
  title: z.string().max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  status: roadmapStatusSchema.optional(),
});

export const deleteRoadmapInputSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
});

// Generation schemas
export const generateRoadmapPreferencesSchema = z.object({
  difficulty: difficultySchema.optional(),
  timeCommitment: timeCommitmentSchema.optional(),
  learningStyle: learningStyleSchema.optional(),
  focusAreas: z
    .array(z.string().min(1).max(100))
    .max(10, "Too many focus areas")
    .optional(),
});

export const generateRoadmapRequestSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
  skill: z.string().min(1, "Skill is required").max(200, "Skill name too long"),
  userPrompt: z
    .string()
    .min(10, "Please provide more details")
    .max(2000, "Prompt too long"),
  preferences: generateRoadmapPreferencesSchema.optional(),
});

// Progress tracking schemas
export const nodeProgressUpdateSchema = z.object({
  nodeId: z.string().uuid("Invalid node ID"),
  status: roadmapNodeStatusSchema,
  timeSpentMinutes: z.number().min(0).max(10080).optional(), // max 7 days in minutes
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const updateRoadmapProgressSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
  updates: z
    .array(nodeProgressUpdateSchema)
    .min(1, "At least one update required"),
});

// Node management schemas
export const createRoadmapNodeSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
  title: z.string().min(1, "Node title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  level: z.number().int().min(0).max(10),
  orderIndex: z.number().int().min(0),
  parentNodeId: z.string().uuid("Invalid parent node ID").optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(10080).optional(),
});

export const updateRoadmapNodeSchema = z.object({
  nodeId: z.string().uuid("Invalid node ID"),
  title: z
    .string()
    .min(1, "Node title is required")
    .max(200, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  status: roadmapNodeStatusSchema.optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(10080).optional(),
});

export const deleteRoadmapNodeSchema = z.object({
  nodeId: z.string().uuid("Invalid node ID"),
});

// Video management schemas
export const addVideoToNodeSchema = z.object({
  nodeId: z.string().uuid("Invalid node ID"),
  videoId: z.string().uuid("Invalid video ID"),
  isPrimary: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export const removeVideoFromNodeSchema = z.object({
  nodeId: z.string().uuid("Invalid node ID"),
  videoId: z.string().uuid("Invalid video ID"),
});

export const searchYouTubeVideosSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(200, "Query too long"),
  maxResults: z.number().int().min(1).max(50).default(5),
  order: z.enum(["relevance", "date", "viewCount"]).default("relevance"),
  videoDuration: z.enum(["short", "medium", "long"]).default("medium"),
});

// Form schemas
export const createRoadmapFormSchema = z.object({
  skillName: z
    .string()
    .min(1, "Skill name is required")
    .max(200, "Skill name too long"),
  title: z.string().max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  difficulty: difficultySchema,
  timeCommitment: timeCommitmentSchema,
  learningStyle: learningStyleSchema,
  focusAreas: z
    .array(z.string().min(1).max(100))
    .max(10, "Too many focus areas"),
  customPrompt: z.string().max(2000, "Custom prompt too long").optional(),
});

// Query schemas
export const getRoadmapSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
});

export const getRoadmapListSchema = z.object({
  status: z.array(roadmapStatusSchema).optional(),
  skill: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z
    .enum(["created_at", "updated_at", "title", "status"])
    .default("updated_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const getRoadmapNodesSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
  includeVideos: z.boolean().default(true),
  includeProgress: z.boolean().default(true),
});

export const getRoadmapMindmapSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
});

export const getRoadmapProgressSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID"),
});

// Search and filter schemas
export const roadmapSearchFiltersSchema = z.object({
  status: z.array(roadmapStatusSchema).optional(),
  skill: z.string().max(200).optional(),
  difficulty: z.array(difficultySchema).optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  sortBy: z
    .enum(["created_at", "updated_at", "progress", "title"])
    .default("updated_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Validation utilities
export const validateRoadmapId = (id: string): boolean => {
  return z.string().uuid().safeParse(id).success;
};

export const validateNodeId = (id: string): boolean => {
  return z.string().uuid().safeParse(id).success;
};

export const validateVideoId = (id: string): boolean => {
  return z.string().uuid().safeParse(id).success;
};

// Type inference exports
export type CreateRoadmapInput = z.infer<typeof createRoadmapInputSchema>;
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapInputSchema>;
export type DeleteRoadmapInput = z.infer<typeof deleteRoadmapInputSchema>;
export type GenerateRoadmapRequest = z.infer<
  typeof generateRoadmapRequestSchema
>;
export type NodeProgressUpdate = z.infer<typeof nodeProgressUpdateSchema>;
export type UpdateRoadmapProgress = z.infer<typeof updateRoadmapProgressSchema>;
export type CreateRoadmapNode = z.infer<typeof createRoadmapNodeSchema>;
export type UpdateRoadmapNode = z.infer<typeof updateRoadmapNodeSchema>;
export type DeleteRoadmapNode = z.infer<typeof deleteRoadmapNodeSchema>;
export type AddVideoToNode = z.infer<typeof addVideoToNodeSchema>;
export type RemoveVideoFromNode = z.infer<typeof removeVideoFromNodeSchema>;
export type SearchYouTubeVideos = z.infer<typeof searchYouTubeVideosSchema>;
export type CreateRoadmapForm = z.infer<typeof createRoadmapFormSchema>;
export type GetRoadmap = z.infer<typeof getRoadmapSchema>;
export type GetRoadmapList = z.infer<typeof getRoadmapListSchema>;
export type GetRoadmapNodes = z.infer<typeof getRoadmapNodesSchema>;
export type GetRoadmapMindmap = z.infer<typeof getRoadmapMindmapSchema>;
export type GetRoadmapProgress = z.infer<typeof getRoadmapProgressSchema>;
export type RoadmapSearchFilters = z.infer<typeof roadmapSearchFiltersSchema>;
