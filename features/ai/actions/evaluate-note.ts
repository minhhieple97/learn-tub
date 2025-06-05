import { authAction } from '@/lib/safe-action';
import { CreateAIEvaluationSchema } from '../schemas';


export const evaluateNoteAction = authAction
  .inputSchema(CreateAIEvaluationSchema)
  .action(async ({ parsedInput: { noteId, provider, model } }) => {
    return {
      success: true,
      streamUrl: `/api/ai/evaluate-note?noteId=${noteId}&provider=${provider}&model=${model}`,
      noteId,
    };
  });
