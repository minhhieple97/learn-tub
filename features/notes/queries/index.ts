'use server';

import { createClient } from '@/lib/supabase/server';
import { INote } from '../types';
import { AIProvider } from '@/types';
import { Json } from '@/database.types';
import { INoteEvaluationResult } from '@/features/quizzes/types';
import { AI_DEFAULTS, AI_PROVIDERS } from '@/config/constants';

export async function getNotesByVideoId(videoId: string, userId: string): Promise<INote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .order('timestamp_seconds', { ascending: true });

  if (error) {
    console.error('Error fetching notes:', error);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }

  return data || [];
}

export async function getNoteById(noteId: string, userId: string): Promise<INote | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching note:', error);
    throw new Error(`Failed to fetch note: ${error.message}`);
  }

  return data;
}

export async function getUserNotes(userId: string, limit?: number): Promise<INote[]> {
  const supabase = await createClient();

  let query = supabase
    .from('notes')
    .select(
      `
      *,
      videos!inner(title, youtube_id)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user notes:', error);
    throw new Error(`Failed to fetch user notes: ${error.message}`);
  }

  return data || [];
}

export const searchNotes = async (userId: string, searchTerm: string): Promise<INote[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select(
      `
      *,
      videos!inner(title, youtube_id)
    `,
    )
    .eq('user_id', userId)
    .or(`content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching notes:', error);
    throw new Error(`Failed to search notes: ${error.message}`);
  }

  return data || [];
};

export const createNoteInteraction = async (
  userId: string,
  noteId: string,
  provider: AIProvider,
  model: string,
  feedback: Json,
): Promise<{ id: string }> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('note_interactions')
    .insert({
      user_id: userId,
      note_id: noteId,
      interaction_type: 'note_evaluation',
      input_data: {
        provider,
        model,
        note_id: noteId,
      },
      output_data: feedback,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save AI interaction: ${error.message}`);
  }

  return { id: data.id };
};

export const getNoteInteractionsByNoteId = async (
  noteId: string,
  userId: string,
): Promise<INoteEvaluationResult[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('note_interactions')
    .select('*')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .eq('interaction_type', 'note_evaluation')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch AI interactions: ${error.message}`);
  }

  return data.map((interaction) => {
    const inputData =
      interaction.input_data &&
      typeof interaction.input_data === 'object' &&
      !Array.isArray(interaction.input_data)
        ? interaction.input_data
        : {};

    return {
      id: interaction.id,
      note_id: interaction.note_id || '',
      user_id: interaction.user_id,
      provider: (typeof inputData.provider === 'string'
        ? inputData.provider
        : AI_PROVIDERS.OPENAI) as AIProvider,
      model: typeof inputData.model === 'string' ? inputData.model : AI_DEFAULTS.SERVICE_MODEL,
      feedback: interaction.output_data,
      created_at: interaction.created_at || '',
    };
  });
};

export const getLatestAIEvaluation = async (
  noteId: string,
  userId: string,
): Promise<INoteEvaluationResult | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('note_interactions')
    .select('*')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .eq('interaction_type', 'note_evaluation')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    note_id: data.note_id || '',
    user_id: data.user_id,
    provider: (data.input_data as any)?.provider || AI_PROVIDERS.OPENAI,
    model: (data.input_data as any)?.model || AI_DEFAULTS.SERVICE_MODEL,
    feedback: data.output_data as any,
    created_at: data.created_at || '',
  };
};
