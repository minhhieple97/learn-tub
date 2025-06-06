'use server';

import { NextRequest } from 'next/server';
import { aiQuizService } from '@/features/ai/services/ai-quiz-service';
import { AI_HTTP_STATUS, AI_ERROR_MESSAGES } from '@/config/constants';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const GenerateQuizStreamSchema = z.object({
  videoId: z.string().min(1),
  videoTitle: z.string().optional(),
  videoDescription: z.string().optional(),
  questionCount: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  topics: z.array(z.string()).optional(),
  provider: z.string().min(1),
  model: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(AI_ERROR_MESSAGES.UNAUTHORIZED, {
        status: AI_HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const body = await req.json();
    const data = GenerateQuizStreamSchema.parse(body);

    const stream = await aiQuizService.generateQuestionsStream(data);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream generation error:', error);
    return new Response(
      error instanceof Error ? error.message : AI_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      {
        status: AI_HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
