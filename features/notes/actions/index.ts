'use server';

import { revalidatePath } from 'next/cache';
import { ActionError, authAction } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { 
  saveNoteInputSchema, 
  updateNoteInputSchema, 
  deleteNoteInputSchema 
} from '../schemas';
import type { NoteActionResult } from '../types';
import { routes } from '@/routes';
import { getProfileByUserId } from '@/features/profile/queries';

export const saveNoteAction = authAction
  .inputSchema(saveNoteInputSchema)
  .action(async ({ parsedInput: { videoId, content, timestamp, tags }, ctx: { user } }) => {
    const supabase = await createClient();
    const profile = await getProfileByUserId(user.id);
    const { data, error } = await supabase
      .from('notes')
      .insert({
        video_id: videoId,
        user_id: profile.id,
        content,
        timestamp_seconds: timestamp,
        tags,
      })
      .select('id')
      .single();

    if (error) {
      throw new ActionError(`Failed to save note: ${error.message}`);
    }

    revalidatePath(`/learn/${videoId}`);

    return {
      success: true,
      noteId: data.id,
      message: 'Note saved successfully',
    } satisfies NoteActionResult;
  });

export const updateNoteAction = authAction
  .inputSchema(updateNoteInputSchema)
  .action(async ({ parsedInput: { noteId, content, tags }, ctx: { user } }) => {
    const supabase = await createClient();
    const profile = await getProfileByUserId(user.id);
    const { error } = await supabase
      .from('notes')
      .update({
        content,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', profile.id);

    if (error) {
      throw new ActionError(`Failed to update note: ${error.message}`);
    }

    revalidatePath(routes.learn);

    return {
      success: true,
      noteId,
      message: 'Note updated successfully',
    } satisfies NoteActionResult;
  });

export const deleteNoteAction = authAction
  .inputSchema(deleteNoteInputSchema)
  .action(async ({ parsedInput: { noteId }, ctx: { user } }) => {
    const supabase = await createClient();
    const profile = await getProfileByUserId(user.id);
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', profile.id);

    if (error) {
      throw new ActionError(`Failed to delete note: ${error.message}`);
    }

    revalidatePath(routes.learn);

    return {
      success: true,
      noteId,
      message: 'Note deleted successfully',
    } satisfies NoteActionResult;
  });
