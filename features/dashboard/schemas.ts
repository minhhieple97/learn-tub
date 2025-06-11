import { z } from 'zod';
export const RetakeQuizSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});
