'use client';

import { useCallback } from 'react';
import { useNotesForm } from './use-notes-form';
import { useTags } from './use-tags';
import { useNotesOperations } from './use-notes-operations';
import type { Note, UseNoteEditorProps, UseNoteEditorReturn } from '../types';

export const useNoteEditorForm = ({ videoId, currentTimestamp }: UseNoteEditorProps): UseNoteEditorReturn => {
  const { 
    content, 
    setContent, 
    editingNoteId, 
    resetForm, 
    isEditing, 
    setEditingNote 
  } = useNotesForm();
  
  const { 
    tags, 
    tagInput, 
    setTagInput, 
    addTag, 
    removeTag, 
    setTags, 
    resetTags 
  } = useTags();
  
  const { saveNote, updateNote, isLoading } = useNotesOperations(videoId);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  const handleAddTag = useCallback(() => {
    addTag();
  }, [addTag]);

  const handleRemoveTag = useCallback((tag: string) => {
    removeTag(tag);
  }, [removeTag]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    
    if (isEditing && editingNoteId) {
      updateNote({ noteId: editingNoteId, content, tags });
    } else {
      saveNote({ videoId, content, tags, timestamp: currentTimestamp });
    }
    
    resetForm();
    resetTags();
  }, [
    content, 
    tags, 
    isEditing, 
    editingNoteId, 
    videoId,
    currentTimestamp, 
    updateNote, 
    saveNote, 
    resetForm, 
    resetTags
  ]);

  const handleCancel = useCallback(() => {
    resetForm();
    resetTags();
  }, [resetForm, resetTags]);

  // Enhanced setEditingNote that also sets tags
  const handleSetEditingNote = useCallback((note: Note | null) => {
    if (note) {
      setEditingNote(note);
      setTags(note.tags || []);
    } else {
      setEditingNote(null);
    }
  }, [setEditingNote, setTags]);

  return {
    content,
    setContent,
    isEditing,
    tags,
    tagInput,
    setTagInput,
    isLoading,
    handleSave,
    handleCancel,
    handleAddTag,
    handleRemoveTag,
    handleKeyDown,
    setEditingNote: handleSetEditingNote,
  };
}; 