'use client';

import type React from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TimestampDisplay } from './timestamp-display';
import { TagsSection } from './tags-section';
import { FormActions } from './form-actions';
import { useNoteEditorForm } from '../hooks/use-note-editor-form';
import type { NoteEditorFormProps, Note } from '../types';

export type NoteEditorFormRef = {
  setEditingNote: (note: Note | null) => void;
};

export const NoteEditorForm = forwardRef<NoteEditorFormRef, NoteEditorFormProps>(
  ({ videoId, currentTimestamp }, ref) => {
    const {
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
      setEditingNote,
    } = useNoteEditorForm({ videoId, currentTimestamp });

    useImperativeHandle(
      ref,
      () => ({
        setEditingNote,
      }),
      [setEditingNote],
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>Take Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimestampDisplay timestamp={currentTimestamp} clickable={false} />

          <Textarea
            placeholder="Write your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />

          <TagsSection
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onKeyDown={handleKeyDown}
          />

          <FormActions
            isLoading={isLoading}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  },
);

NoteEditorForm.displayName = 'NoteEditorForm';
