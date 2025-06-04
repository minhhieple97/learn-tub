'use client';

import { useCallback, useRef } from 'react';
import { useVideoId } from './use-video-id';
import { useNotesData } from './use-notes-data';
import { useNotesOperations } from './use-notes-operations';
import type { Note, NoteEditorFormRef } from '../types';
import { VideoPageData } from '@/features/videos/types';

type UseNoteEditorProps = {
  video: VideoPageData;
  onTimestampClick?: (timestamp: number) => void;
};

type UseNoteEditorReturn = {
  notes: Note[];
  isLoading: boolean;
  formRef: React.RefObject<NoteEditorFormRef | null>;  
  handleTimestampClick: (timestamp: number) => void;
  handleEditNote: (note: Note) => void;
  handleDeleteNote: (noteId: string) => Promise<void>;
};

export const useNoteEditor = ({ 
  video, 
  onTimestampClick 
}: UseNoteEditorProps): UseNoteEditorReturn => {
  const formRef = useRef<NoteEditorFormRef>(null);
  const { notes, refetch, isLoading } = useNotesData(video.id);
  const { deleteNote } = useNotesOperations(video.id);

  const handleTimestampClick = useCallback(
    (timestamp: number) => {
      onTimestampClick?.(timestamp);
    },
    [onTimestampClick],
  );

  const handleEditNote = useCallback((note: Note) => {
    formRef.current?.setEditingNote(note);
  }, []);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      await refetch();
    },
    [deleteNote, refetch],
  );

  return {
    notes,
    isLoading,
    formRef,
    handleTimestampClick,
    handleEditNote,
    handleDeleteNote,
  };
}; 