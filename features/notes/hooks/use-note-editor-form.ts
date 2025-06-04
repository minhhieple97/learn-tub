'use client';

import { useCallback } from 'react';
import { useVideoId } from './use-video-id';
import { useNotesForm } from './use-notes-form';
import { useTags } from './use-tags';
import { useNotesOperations } from './use-notes-operations';
import type { Note, UseNoteEditorProps, UseNoteEditorReturn } from '../types';

export const useNoteEditorForm = ({ videoId, currentTimestamp }: UseNoteEditorProps): UseNoteEditorReturn => {
  // Get database video ID from YouTube ID
  const { dbVideoId, isLoading: isVideoIdLoading } = useVideoId(videoId);
  
  // Form state management
  const { 
    content, 
    setContent, 
    editingNoteId, 
    resetForm, 
    isEditing, 
    setEditingNote 
  } = useNotesForm();
  
  // Tags management
  const { 
    tags, 
    tagInput, 
    setTagInput, 
    addTag, 
    removeTag, 
    setTags, 
    resetTags 
  } = useTags();
  
  // Note operations
  const { saveNote, updateNote, isLoading } = useNotesOperations(dbVideoId);

  // Event handlers
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
      
      // Reset form after successful save
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
    // Form state
    content,
    setContent,
    isEditing,
    
    // Tags
    tags,
    tagInput,
    setTagInput,
    
    // Loading states
    isLoading,
    isVideoIdLoading,
    
    // Actions
    handleSave,
    handleCancel,
    handleAddTag,
    handleRemoveTag,
    handleKeyDown,
    setEditingNote: handleSetEditingNote,
  };
}; 