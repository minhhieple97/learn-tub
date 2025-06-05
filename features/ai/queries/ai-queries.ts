import { createClient } from '@/lib/supabase/server';
import { UserNote, VideoInfo, VideoWithNotes } from '../types';

export const getVideoWithNotes = async (
  videoId: string,
  userId: string,
): Promise<VideoWithNotes | undefined> => {
  const supabase = await createClient();

  const { data: video, error } = await supabase
    .from('videos')
    .select('id, title, youtube_id')
    .eq('id', videoId)
    .eq('user_id', userId)
    .single();

  if (error || !video) {
    return undefined;
  }

  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('content')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .order('timestamp_seconds');

  if (notesError) {
    throw new Error(`Failed to fetch notes: ${notesError.message}`);
  }

  return {
    ...video,
    notes: notes || [],
  };
};

export const getVideoInfo = async (
  videoId: string,
  userId: string,
): Promise<VideoInfo | undefined> => {
  const supabase = await createClient();

  const { data: video, error } = await supabase
    .from('videos')
    .select('id, title, youtube_id')
    .eq('id', videoId)
    .eq('user_id', userId)
    .single();

  if (error || !video) {
    return undefined;
  }

  return video;
};

export const getUserNotesForVideo = async (
  videoId: string,
  userId: string,
): Promise<UserNote[]> => {
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from('notes')
    .select('content')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .order('timestamp_seconds');

  if (error) {
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }

  return notes || [];
};

export const storeAIInteraction = async (
  userId: string,
  interactionType: string,
  inputData: Record<string, unknown>,
  outputData: Record<string, unknown>,
) => {
  const supabase = await createClient();

  const { error } = await supabase.from('ai_interactions').insert({
    user_id: userId,
    interaction_type: interactionType,
    input_data: inputData,
    output_data: outputData,
  });

  if (error) {
    throw new Error(`Failed to store AI interaction: ${error.message}`);
  }
};
