'use client';

import { useAction } from 'next-safe-action/hooks';
import { useToast } from '@/components/ui/use-toast';
import { TOAST_MESSAGES } from '@/config/constants';
import { saveNoteAction, updateNoteAction, deleteNoteAction } from '../actions';
import type { SaveNoteInput, UpdateNoteInput, DeleteNoteInput, UseNotesOperationsReturn } from '../types';

export const useNotesOperations = (videoId: string | null): UseNotesOperationsReturn => {
  const { toast } = useToast();

  const { execute: executeSave, isPending: isSavePending } = useAction(saveNoteAction, {
    onError: ({ error }) => {
      toast({
        title: 'Error',
        description: error.serverError || TOAST_MESSAGES.NOTE_SAVE_ERROR,
        variant: 'destructive',
      });
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast({
          title: 'Success',
          description: TOAST_MESSAGES.NOTE_SAVED_SUCCESS,
        });
      }
    },
  });

  const { execute: executeUpdate, isPending: isUpdatePending } = useAction(updateNoteAction, {
    onError: ({ error }) => {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: error.serverError || TOAST_MESSAGES.NOTE_UPDATE_ERROR,
        variant: 'destructive',
      });
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast({
          title: 'Success',
          description: TOAST_MESSAGES.NOTE_UPDATED_SUCCESS,
        });
      }
    },
  });

  const { execute: executeDelete, isPending: isDeletePending } = useAction(deleteNoteAction, {
    onError: ({ error }) => {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: error.serverError || TOAST_MESSAGES.NOTE_DELETE_ERROR,
        variant: 'destructive',
      });
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast({
          title: 'Success',
          description: TOAST_MESSAGES.NOTE_DELETED_SUCCESS,
        });
      }
    },
  });

  const saveNote = (payload: SaveNoteInput) => {
    if (!payload.content.trim() || !videoId) return;
    
    executeSave({
      videoId,
      content: payload.content,
      timestamp: payload.timestamp,
      tags: payload.tags,
    });
  };

  const updateNote = (payload: UpdateNoteInput) => {
    executeUpdate({
      noteId: payload.noteId,
      content: payload.content,
      tags: payload.tags,
    });
  };

  const deleteNote = (payload: DeleteNoteInput) => {
    executeDelete({
      noteId: payload.noteId,
    });
  };

  const isLoading = isSavePending || isUpdatePending || isDeletePending;

  return {
    saveNote,
    updateNote,
    deleteNote,
    isLoading,
  };
};
