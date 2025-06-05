import { authAction } from '@/lib/safe-action';
import { CreateAIEvaluationSchema } from '../schemas';
import { AI_API } from '@/config/constants';

export const evaluateNoteAction = authAction
  .inputSchema(CreateAIEvaluationSchema)
  .action(async ({ parsedInput: { noteId, provider, model } }) => {
    return {
      success: true,
      streamUrl: `${AI_API.EVALUATE_NOTE_PATH}?noteId=${noteId}&provider=${provider}&model=${model}`,
      noteId,
    };
  });
