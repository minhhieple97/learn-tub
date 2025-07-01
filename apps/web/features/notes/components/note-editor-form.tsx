"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimestampDisplay } from "./timestamp-display";
import { TagsSection } from "./tags-section";
import { NoteFormActions } from "./note-form-actions";
import { RichTextEditor } from "./rich-text-editor";
import { useNoteEditorForm } from "../hooks";
import { VALIDATION_LIMITS } from "@/config/constants";

export const NoteEditorForm = () => {
  const {
    currentTimestamp,
    isEditing,
    isSaveDisabled,
    isFormLoading,
    handleTagInputChange,
    handleAddTag,
    handleKeyDown,
    handleSave,
    removeTag,
    cancelEditing,
  } = useNoteEditorForm();

  // The useRichTextEditor hook is now used directly in RichTextEditor component

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimestampDisplay timestamp={currentTimestamp} clickable={false} />

        <div className="space-y-2">
          <RichTextEditor />
        </div>

        <TagsSection
          onTagInputChange={handleTagInputChange}
          onAddTag={handleAddTag}
          onRemoveTag={removeTag}
          onKeyDown={handleKeyDown}
        />

        <NoteFormActions
          isLoading={isFormLoading}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={cancelEditing}
          disabled={isSaveDisabled}
        />
      </CardContent>
    </Card>
  );
};
