'use server';

import { authAction } from '@/lib/safe-action';


import { createClient } from '@/lib/supabase/server';
import { getProfileByUserId } from '@/features/profile/queries/profile';
import { DeleteAIFeedbackSchema, GetAIFeedbackHistorySchema } from '../schema';
import { getNoteInteractionsByNoteId } from '@/features/notes/queries';

export const getAIFeedbackHistoryAction = authAction
  .inputSchema(GetAIFeedbackHistorySchema)
  .action(async ({ parsedInput: { noteId }, ctx: { user } }) => {
    try {
      const history = await getNoteInteractionsByNoteId(noteId, user.id);

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AI feedback history',
      };
    }
  });

export const deleteAIFeedbackAction = authAction
  .inputSchema(DeleteAIFeedbackSchema)
  .action(async ({ parsedInput: { feedbackId }, ctx: { user } }) => {
    const supabase = await createClient();
    const profile = await getProfileByUserId(user.id);
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    const { error } = await supabase
      .from('note_interactions')
      .delete()
      .eq('id', feedbackId)
      .eq('user_id', profile.id);

    if (error) {
      throw new Error(`Failed to delete AI feedback: ${error.message}`);
    }

    return {
      success: true,
      message: 'AI feedback deleted successfully',
    };
  });
