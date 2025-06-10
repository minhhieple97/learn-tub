import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import {
  AI_PROVIDERS,
  RESPONSE_HEADERS,
  CHUNK_TYPES,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from '@/config/constants';

import { getProfileByUserId } from '@/features/profile/queries/profile';
import { aiEvaluationService } from '@/features/quizzes/services';
import { createAIInteraction } from '@/features/quizzes/queries';
import { NoteEvaluationRequest } from '@/features/notes/types';
import { IFeedback, StreamChunk } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const provider = searchParams.get('provider') as
      | typeof AI_PROVIDERS.OPENAI
      | typeof AI_PROVIDERS.GEMINI;
    const model = searchParams.get('model');

    if (!noteId || !provider || !model) {
      return new Response(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(ERROR_MESSAGES.UNAUTHORIZED, {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }
    const profile = await getProfileByUserId(user.id);
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('content, timestamp_seconds')
      .eq('id', noteId)
      .eq('user_id', profile.id)
      .single();

    if (noteError || !note) {
      return new Response(ERROR_MESSAGES.NOTE_NOT_FOUND, {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const evaluationRequest: NoteEvaluationRequest = {
      noteId,
      provider,
      model,
      content: note.content,
      context: {
        timestamp: note.timestamp_seconds,
      },
    };

    const aiStream = await aiEvaluationService.evaluateNote(evaluationRequest);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = aiStream.getReader();

        try {
          let feedback: IFeedback | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(value)}\n\n`),
            );

            if (value.type === CHUNK_TYPES.COMPLETE && value.content) {
              try {
                feedback = JSON.parse(value.content) as IFeedback;
                await createAIInteraction(
                  profile.id,
                  noteId,
                  provider,
                  model,
                  feedback,
                );
              } catch (parseError) {
                console.error(
                  ERROR_MESSAGES.FAILED_TO_PARSE_AI_FEEDBACK,
                  parseError,
                );
              }
            }
          }
        } catch (error) {
          const errorChunk: StreamChunk = {
            type: CHUNK_TYPES.ERROR,
            content:
              error instanceof Error
                ? error.message
                : ERROR_MESSAGES.UNKNOWN_ERROR,
            finished: true,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': RESPONSE_HEADERS.SSE_CONTENT_TYPE,
        'Cache-Control': RESPONSE_HEADERS.CACHE_CONTROL,
        Connection: RESPONSE_HEADERS.CONNECTION,
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': RESPONSE_HEADERS.JSON_CONTENT_TYPE },
      },
    );
  }
}
