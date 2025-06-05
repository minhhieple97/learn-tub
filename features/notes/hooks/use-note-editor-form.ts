'use client';

import { useCallback } from 'react';
import { useNotesStore } from '../store';
import { VALIDATION_LIMITS, TOAST_MESSAGES } from '@/config/constants';
import { useToast } from '@/hooks/use-toast';

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const useNoteEditorForm = () => {
  const { toast } = useToast();
  const {
    formContent,
    formTags,
    tagInput,
    editingNote,
    isFormLoading,
    currentTimestamp,
    setFormContent,
    setTagInput,
    addTag,
    removeTag,
    cancelEditing,
    saveNote,
    updateNote,
  } = useNotesStore();

  const validateContent = useCallback((content: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!content.trim()) {
      errors.push(TOAST_MESSAGES.VALIDATION_EMPTY_CONTENT);
    }
    
    if (content.length > VALIDATION_LIMITS.NOTE_CONTENT_MAX_LENGTH) {
      errors.push(TOAST_MESSAGES.VALIDATION_NOTE_TOO_LONG);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const validateTags = useCallback((tags: string[]): ValidationResult => {
    const errors: string[] = [];
    
    if (tags.length > VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      errors.push(TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS);
    }

    const invalidTags = tags.filter(tag => tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH);
    if (invalidTags.length > 0) {
      errors.push(TOAST_MESSAGES.VALIDATION_TAG_TOO_LONG);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const validateTagInput = useCallback((tagInput: string): boolean => {
    return tagInput.length <= VALIDATION_LIMITS.TAG_MAX_LENGTH;
  }, []);

  const showValidationErrors = useCallback((errors: string[]) => {
    errors.forEach(error => {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive',
      });
    });
  }, [toast]);

  const handleContentChange = useCallback((content: string) => {
    if (content.length <= VALIDATION_LIMITS.NOTE_CONTENT_MAX_LENGTH) {
      setFormContent(content);
    }
  }, [setFormContent]);

  const handleTagInputChange = useCallback((input: string) => {
    if (validateTagInput(input)) {
      setTagInput(input);
    }
  }, [setTagInput, validateTagInput]);
  const handleAddTag = useCallback((tag?: string) => {
    const tagToAdd = tag || tagInput;
    if (!tagToAdd.trim()) return;
    if (formTags.length >= VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      showValidationErrors([TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS]);
      return;
    }
    
    if (tagToAdd.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
      showValidationErrors([TOAST_MESSAGES.VALIDATION_TAG_TOO_LONG]);
      return;
    }
    addTag(tag);
  }, [tagInput, formTags.length, addTag, showValidationErrors]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleSave = useCallback(() => {
    const contentValidation = validateContent(formContent);
    const tagsValidation = validateTags(formTags);
    const allErrors = [...contentValidation.errors, ...tagsValidation.errors];
    if (allErrors.length > 0) {
      showValidationErrors(allErrors);
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, formContent, formTags, toast);
    } else {
      saveNote(formContent, formTags, currentTimestamp, toast);
    }
  }, [
    formContent, 
    formTags, 
    editingNote, 
    currentTimestamp, 
    validateContent, 
    validateTags, 
    showValidationErrors, 
    updateNote, 
    saveNote, 
    toast
  ]);

  const isFormValid = useCallback(() => {
    const contentValidation = validateContent(formContent);
    const tagsValidation = validateTags(formTags);
    return contentValidation.isValid && tagsValidation.isValid;
  }, [formContent, formTags, validateContent, validateTags]);



  const isEditing = !!editingNote;
  const isSaveDisabled = isFormLoading || !isFormValid();

  return {
    formContent,
    formTags,
    tagInput,
    editingNote,
    isFormLoading,
    currentTimestamp,
    isEditing,
    isSaveDisabled,
    
    handleContentChange,
    handleTagInputChange,
    handleAddTag,
    handleKeyDown,
    handleSave,
    removeTag,
    cancelEditing,
    
    isFormValid,
    validateTagInput,
  };
}; 