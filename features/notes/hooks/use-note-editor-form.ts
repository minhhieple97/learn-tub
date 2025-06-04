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

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    
    try {
      if (isEditing && editingNoteId) {
        await updateNote(editingNoteId, { content, tags });
      } else {
        await saveNote({ content, tags, timestamp: currentTimestamp });
      }
      
      resetForm();
      resetTags();
    } catch (error) {
      // Error handling is done in the operations hook
      console.error('Error in handleSave:', error);
    }
  }, [
    content, 
    tags, 
    isEditing, 
    editingNoteId, 
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