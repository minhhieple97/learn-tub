import { z } from "zod";

export const addVideoSchema = z.object({
  videoUrl: z.string().min(1, "Video URL is required"),
  tutorial: z
    .string()
    .max(500, "Tutorial text cannot exceed 500 characters")
    .optional(),
});
