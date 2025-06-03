'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { CreateNotePayload, UpdateNotePayload, UseNotesOperationsReturn } from '../types';

export const useNotesOperations = (dbVideoId: string | null): UseNotesOperationsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const saveNote = useCallback(
    async (payload: { content: string; tags: string[]; timestamp: number }) => {
      if (!payload.content.trim() || !dbVideoId) return;

      setIsLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast({
            title: 'Authentication Error',
            description: 'You must be logged in to save notes',
            variant: 'destructive',
          });
          return;
        }

        const createPayload: CreateNotePayload = {
          video_id: dbVideoId,
          user_id: user.user.id,
          content: payload.content,
          timestamp_seconds: payload.timestamp,
          tags: payload.tags,
        };

        const { error } = await supabase.from('notes').insert(createPayload);
        if (error) throw error;

        toast({
          title: 'Note Saved',
          description: 'Your note has been saved successfully',
        });
      } catch (error) {
        console.error('Error saving note:', error);
        toast({
          title: 'Error',
          description: 'Failed to save note. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dbVideoId, supabase, toast],
  );

  const updateNote = useCallback(
    async (id: string, payload: { content: string; tags: string[] }) => {
      setIsLoading(true);
      try {
        const updatePayload: UpdateNotePayload = {
          content: payload.content,
          tags: payload.tags,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('notes').update(updatePayload).eq('id', id);

        if (error) throw error;

        toast({
          title: 'Note Updated',
          description: 'Your note has been updated successfully',
        });
      } catch (error) {
        console.error('Error updating note:', error);
        toast({
          title: 'Error',
          description: 'Failed to update note. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;

        toast({
          title: 'Note Deleted',
          description: 'Your note has been deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting note:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete note. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [supabase, toast],
  );

  return {
    saveNote,
    updateNote,
    deleteNote,
    isLoading,
  };
};
