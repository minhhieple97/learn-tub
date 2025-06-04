'use server';

import { createClient } from '@/lib/supabase/server';
import type { Note } from '../types';

export async function getNotesByVideoId(videoId: string, userId: string): Promise<Note[]> {
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

export async function getNoteById(noteId: string, userId: string): Promise<Note | null> {
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

export async function getUserNotes(userId: string, limit?: number): Promise<Note[]> {
  const supabase = await createClient();

  let query = supabase
    .from('notes')
    .select(`
      *,
      videos!inner(title, youtube_id)
    `)
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

export async function searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      videos!inner(title, youtube_id)
    `)
    .eq('user_id', userId)
    .or(`content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching notes:', error);
    throw new Error(`Failed to search notes: ${error.message}`);
  }

  return data || [];
}
