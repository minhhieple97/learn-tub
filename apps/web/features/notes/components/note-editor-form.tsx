"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TimestampDisplay } from "./timestamp-display";
import { TagsSection } from "./tags-section";
import { NoteFormActions } from "./note-form-actions";
import { useNoteEditorForm } from "../hooks";
import { VALIDATION_LIMITS } from "@/config/constants";

export const NoteEditorForm = () => {
  const {
    formContent,
    currentTimestamp,
    isEditing,
    isSaveDisabled,
    isFormLoading,
    handleContentChange,
    handleTagInputChange,
    handleAddTag,
    handleKeyDown,
    handleSave,
    removeTag,
    cancelEditing,
  } = useNoteEditorForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimestampDisplay timestamp={currentTimestamp} clickable={false} />

        <div className="space-y-2">
          <Textarea
            placeholder="Write your notes here..."
            value={formContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[100px]"
          />
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
