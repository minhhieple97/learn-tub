import { authAction } from '@/lib/safe-action';
import { CreateAIEvaluationSchema } from '../schemas';
import { createAIInteraction } from '../queries';
import type { AIEvaluationRequest, AIStreamChunk } from '../types';

export const evaluateNoteAction = authAction
  .schema(CreateAIEvaluationSchema)
  .action(async ({ parsedInput: { noteId, provider, model }, ctx: { user } }) => {
    try {
      // This action will return the stream endpoint URL instead of handling streaming directly
      // The actual streaming will be handled by a separate API route
      return {
        success: true,
        streamUrl: `/api/ai/evaluate-note?noteId=${noteId}&provider=${provider}&model=${model}`,
        noteId,
      };
    } catch (error) {
      throw new Error(
        `Failed to initiate AI evaluation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  });
