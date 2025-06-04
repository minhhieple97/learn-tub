import { z } from "zod";

export const addVideoSchema = z.object({
  videoUrl: z.string().min(1, 'Video URL is required'),
});
