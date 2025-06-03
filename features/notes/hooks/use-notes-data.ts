'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Note, UseNotesDataReturn } from '../types';

export const useNotesData = (dbVideoId: string | null): UseNotesDataReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    if (!dbVideoId) return;

    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('video_id', dbVideoId)
        .eq('user_id', user.user.id)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dbVideoId, supabase]);

  useEffect(() => {
    if (!dbVideoId) return;

    fetchNotes();

    // Set up real-time subscription
    const notesSubscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `video_id=eq.${dbVideoId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [...prev, payload.new as Note]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) =>
              prev.map((note) => (note.id === payload.new.id ? (payload.new as Note) : note)),
            );
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((note) => note.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
    };
  }, [dbVideoId, fetchNotes, supabase]);

  return { notes, isLoading, refetch: fetchNotes };
};
