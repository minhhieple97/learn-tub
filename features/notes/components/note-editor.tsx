'use client';

import { NoteEditorForm } from './note-editor-form';
import { NotesList } from './notes-list';
import { useNoteEditor } from '../hooks/use-note-editor';
import type { NoteEditorProps } from '../types';

export const NoteEditor = ({ video, currentTimestamp, onTimestampClick }: NoteEditorProps) => {
  const { notes, formRef, handleTimestampClick, handleEditNote, handleDeleteNote } = useNoteEditor({
    video,
    onTimestampClick,
  });

  return (
    <div className="space-y-4">
      <NoteEditorForm ref={formRef} videoId={video.id} currentTimestamp={currentTimestamp} />

      <NotesList
        notes={notes}
        onTimestampClick={handleTimestampClick}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};
