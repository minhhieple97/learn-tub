'use client';

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TimestampDisplay } from './timestamp-display';
import { TagsSection } from './tags-section';
import { FormActions } from './form-actions';
import { useNotesForm } from '../hooks/use-notes-form';
import { useTags } from '../hooks/use-tags';
import { useNotesOperations } from '../hooks/use-notes-operations';
import { useTimestampFormatter } from '../hooks/use-timestamp-formatter';
import type { NoteEditorFormProps } from '../types';

export function NoteEditorForm({ videoId, currentTimestamp }: NoteEditorFormProps) {
  const { formatTimestamp } = useTimestampFormatter();
  const { content, setContent, editingNoteId, resetForm, isEditing, setEditingNote } =
    useNotesForm();
  const { tags, tagInput, setTagInput, addTag, removeTag, setTags, resetTags } = useTags();

  // Note: We need dbVideoId here, so we might need to pass it from parent or get it here
  const { saveNote, updateNote, isLoading } = useNotesOperations(null); // This needs to be fixed

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    if (isEditing && editingNoteId) {
      await updateNote(editingNoteId, { content, tags });
    } else {
      await saveNote({ content, tags, timestamp: currentTimestamp });
    }
    resetForm();
    resetTags();
  };

  const handleCancel = () => {
    resetForm();
    resetTags();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimestampDisplay
          timestamp={currentTimestamp}
          formatTimestamp={formatTimestamp}
          clickable={false}
        />

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
          onAddTag={addTag}
          onRemoveTag={removeTag}
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
}
