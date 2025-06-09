'use server';
import { authAction } from '@/lib/safe-action';
import { z } from 'zod';
import { aiQuizService } from '../services/ai-quiz-service';
import { createQuizSession } from '../queries/quiz-queries';
import { getProfileByUserId } from '@/features/profile/queries/profile';

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

export const generateQuizQuestionsAction = authAction
  .inputSchema(GenerateQuizQuestionsSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const profile = await getProfileByUserId(user.id);

    const response = await aiQuizService.generateQuestions(data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate quiz questions');
    }

    const quizSession = await createQuizSession({
      userId: profile.id,
      videoId: data.videoId,
      title: data.videoTitle || `Quiz - ${new Date().toLocaleDateString()}`,
      difficulty: data.difficulty,
      questionCount: data.questionCount,
      topics: data.topics,
      aiProvider: data.provider,
      aiModel: data.model,
      questions: response.questions || [],
    });

    return {
      success: true,
      questions: response.questions || [],
      sessionId: quizSession.id,
    };
  });
