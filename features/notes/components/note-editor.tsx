"use client"

import { useCallback } from 'react';
import { NoteEditorForm } from './note-editor-form';
import { NotesList } from './notes-list';
import { useVideoId } from '../hooks/use-video-id';
import { useNotesData } from '../hooks/use-notes-data';
import { useNotesOperations } from '../hooks/use-notes-operations';
import { useTimestampFormatter } from '../hooks/use-timestamp-formatter';
import type { NoteEditorProps, Note } from '../types';

export function NoteEditor({ videoId, currentTimestamp, onTimestampClick }: NoteEditorProps) {
  const { dbVideoId } = useVideoId(videoId);
  const { notes, refetch } = useNotesData(dbVideoId);
  const { deleteNote } = useNotesOperations(dbVideoId);
  const { formatTimestamp } = useTimestampFormatter();

  const handleTimestampClick = useCallback(
    (timestamp: number) => {
      onTimestampClick?.(timestamp);
    },
    [onTimestampClick],
  );

  const handleEditNote = useCallback((note: Note) => {
    // This needs to be connected to the form state
    // We might need to lift state up or use a context
    console.log('Edit note:', note);
  }, []);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      await refetch();
    },
    [deleteNote, refetch],
  );

  return (
    <div className="space-y-4">
      <NoteEditorForm videoId={videoId} currentTimestamp={currentTimestamp} />

      <NotesList
        notes={notes}
        onTimestampClick={handleTimestampClick}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
        formatTimestamp={formatTimestamp}
      />
    </div>
  );
}
