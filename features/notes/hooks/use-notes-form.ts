'use client';

import { useState, useCallback } from 'react';
import type { Note, UseNotesFormReturn } from '../types';

export const useNotesForm = (): UseNotesFormReturn => {
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const setEditingNote = useCallback((note: Note | null) => {
    if (note) {
      setContent(note.content);
      setEditingNoteId(note.id);
    } else {
      setEditingNoteId(null);
      setContent('');
    }
  }, []);

  const resetForm = useCallback(() => {
    setContent('');
    setEditingNoteId(null);
  }, []);

  const isEditing = editingNoteId !== null;

  return {
    content,
    setContent,
    editingNoteId,
    setEditingNote,
    resetForm,
    isEditing,
  };
};
