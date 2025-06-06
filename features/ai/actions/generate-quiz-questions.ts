'use server';
import { action } from '@/lib/safe-action';
import { z } from 'zod';
import { aiQuizService } from '../services/ai-quiz-service';

const GenerateQuizQuestionsSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  videoTitle: z.string().optional(),
  videoDescription: z.string().optional(),
  questionCount: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  topics: z.array(z.string()).optional(),
  provider: z.string().min(1, 'AI provider is required'),
  model: z.string().min(1, 'AI model is required'),
});

export const generateQuizQuestionsAction = action
  .inputSchema(GenerateQuizQuestionsSchema)
  .action(async ({ parsedInput: data }) => {
    const response = await aiQuizService.generateQuestions(data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate quiz questions');
    }

    return {
      success: true,
      questions: response.questions || [],
    };
  });
