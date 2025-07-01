"use client";

import { useCallback } from "react";
import { useNotesStore } from "../store";
import { VALIDATION_LIMITS, TOAST_MESSAGES } from "@/config/constants";
import { toast } from "@/hooks/use-toast";
import { useInvalidateNotes } from "./use-notes-queries";

type IValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const useNoteEditorForm = () => {
  const {
    formContent,
    formTags,
    tagInput,
    editingNote,
    isFormLoading,
    currentTimestamp,
    currentVideoId,
    setTagInput,
    addTag,
    removeTag,
    cancelEditing,
    saveNote,
    updateNote,
  } = useNotesStore();

  const { invalidateByVideo, invalidateSearch } = useInvalidateNotes();

  const validateTags = useCallback((tags: string[]): IValidationResult => {
    const errors: string[] = [];

    if (tags.length > VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      errors.push(TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS);
    }

    const invalidTags = tags.filter(
      (tag) => tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH,
    );
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
    errors.forEach((error) => {
      toast.error({
        title: "Validation Error",
        description: error,
      });
    });
  }, []);

  const handleTagInputChange = useCallback(
    (input: string) => {
      if (validateTagInput(input)) {
        setTagInput(input);
      }
    },
    [setTagInput, validateTagInput],
  );
  const handleAddTag = useCallback(() => {
    if (!tagInput.trim()) return;
    if (formTags.length >= VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      showValidationErrors([TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS]);
      return;
    }

    if (tagInput.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
      showValidationErrors([TOAST_MESSAGES.VALIDATION_TAG_TOO_LONG]);
      return;
    }
    addTag();
  }, [tagInput, formTags.length, addTag, showValidationErrors]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  const handleSave = useCallback(async () => {
    const tagsValidation = validateTags(formTags);
    if (!tagsValidation.isValid) {
      showValidationErrors(tagsValidation.errors);
      return;
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, formContent, formTags);
      } else {
        await saveNote(formContent, formTags, currentTimestamp);
      }

      // Invalidate queries to refetch data
      if (currentVideoId) {
        invalidateByVideo(currentVideoId);
        invalidateSearch(currentVideoId);
      }
    } catch (error) {
      // Error handling is done in the store methods
      console.error("Error in handleSave:", error);
    }
  }, [
    formContent,
    formTags,
    editingNote,
    currentTimestamp,
    currentVideoId,
    validateTags,
    showValidationErrors,
    updateNote,
    saveNote,
    invalidateByVideo,
    invalidateSearch,
  ]);

  const isFormValid = useCallback(() => {
    const tagsValidation = validateTags(formTags);
    return tagsValidation.isValid;
  }, [formTags, validateTags]);

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
