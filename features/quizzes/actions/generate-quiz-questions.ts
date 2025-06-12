'use server';
import { ActionError, authAction } from '@/lib/safe-action';
import { z } from 'zod';
import { quizService } from '../services/quiz-service';
import { createQuizSession } from '../queries';
import { getProfileByUserId } from '@/features/profile/queries';
import { getVideoById } from '@/features/videos/queries';
import { RateLimiter } from '@/lib/rate-limiter';

const GenerateQuizQuestionsSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  videoTitle: z.string().optional(),
  videoDescription: z.string().optional(),
  videoTutorial: z.string().optional(),
  questionCount: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  topics: z.array(z.string()).optional(),
  provider: z.string().min(1, 'AI provider is required'),
  model: z.string().min(1, 'AI model is required'),
});

export const generateQuizQuestionsAction = authAction
  .inputSchema(GenerateQuizQuestionsSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const rateLimitResult = await RateLimiter.checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      throw new ActionError(
        `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
      );
    }

    const profile = await getProfileByUserId(user.id);

    let videoTitle = data.videoTitle;
    let videoDescription = data.videoDescription;
    let videoTutorial = data.videoTutorial;

    if (!videoTitle || !videoDescription || videoTutorial === undefined) {
      try {
        const video = await getVideoById(data.videoId, profile.id);
        videoTitle = videoTitle || video.title;
        videoDescription = videoDescription || video.description || undefined;
        if (videoTutorial === undefined) {
          videoTutorial = video.tutorial || undefined;
        }
      } catch (error) {
        console.warn('Could not fetch video data:', error);
      }
    }

    const response = await quizService.generateQuestions({
      ...data,
      videoTitle,
      videoDescription,
      videoTutorial,
      userId: profile.id,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate quiz questions');
    }

    const quizSession = await createQuizSession({
      userId: profile.id,
      videoId: data.videoId,
      title: videoTitle || `Quiz - ${new Date().toLocaleDateString()}`,
      difficulty: data.difficulty,
      questionCount: data.questionCount,
      topics: data.topics,
      aiProvider: data.provider,
      aiModel: data.model,
      questions: response.data || [],
    });

    return {
      success: true,
      questions: response.data || [],
      sessionId: quizSession.id,
    };
  });
