import { createClient } from '@/lib/supabase/server';
import type { AIEvaluationResult, AIProvider } from '../types';
import { AI_DEFAULTS, AI_PROVIDERS } from '@/config/constants';

export const createAIInteraction = async (
  userId: string,
  noteId: string,
  provider: AIProvider,
  model: string,
  feedback: Record<string, unknown>,
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

export const getAIInteractionsByNoteId = async (
  noteId: string,
  userId: string,
): Promise<AIEvaluationResult[]> => {
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

  return data.map((interaction) => ({
    id: interaction.id,
    note_id: interaction.note_id,
    user_id: interaction.user_id,
    provider: interaction.input_data?.provider || AI_PROVIDERS.OPENAI,
    model: interaction.input_data?.model || AI_DEFAULTS.SERVICE_MODEL,
    feedback: interaction.output_data,
    created_at: interaction.created_at,
  }));
};

export const getLatestAIEvaluation = async (
  noteId: string,
  userId: string,
): Promise<AIEvaluationResult | null> => {
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
    note_id: data.note_id,
    user_id: data.user_id,
    provider: data.input_data?.provider || AI_PROVIDERS.OPENAI,
    model: data.input_data?.model || AI_DEFAULTS.SERVICE_MODEL,
    feedback: data.output_data,
    created_at: data.created_at,
  };
};
