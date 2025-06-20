'use server';
import { ActionError, authAction } from '@/lib/safe-action';
import { z } from 'zod';
import { quizService } from '../services/quizz-service';
import { createQuizSession } from '../queries';
import { getVideoById } from '@/features/videos/queries';
import { RateLimiter } from '@/lib/rate-limiter';
import { checkProfileByUserId } from '@/lib/require-auth';
import { deductCredits } from '@/features/payments/services/deduction-credit';
import { validateUserCreditsForOperation } from '@/features/payments/queries/credit-queries';
import { AI_COMMANDS, CREDIT_ACTION_COUNTS } from '@/config/constants';

const GenerateQuizQuestionsSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  videoTitle: z.string().optional(),
  videoDescription: z.string().optional(),
  videoTutorial: z.string().optional(),
  questionCount: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  topics: z.array(z.string()).optional(),
  aiModelId: z.string().uuid('AI model ID is required'),
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

    const profile = await checkProfileByUserId(user.id);

    const creditValidation = await validateUserCreditsForOperation(
      profile.id,
      CREDIT_ACTION_COUNTS[AI_COMMANDS.GENERATE_QUIZZ_QUESTIONS],
    );
    if (!creditValidation.success) {
      throw new ActionError(
        creditValidation.message || 'Insufficient credits to generate quiz questions',
      );
    }

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
      aiModelId: data.aiModelId,
      questions: response.data || [],
    });

    const creditResult = await deductCredits({
      userId: profile.id,
      command: AI_COMMANDS.GENERATE_QUIZZ_QUESTIONS,
      description: `Quiz generation for video: ${data.videoId}`,
      relatedActionId: quizSession.id,
    });

    if (!creditResult.success) {
      console.error('Failed to deduct credits after quiz generation:', creditResult.error);
    }

    return {
      success: true,
      questions: response.data || [],
      sessionId: quizSession.id,
    };
  });
