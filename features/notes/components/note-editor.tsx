'use client';

import { useEffect } from 'react';
import { NoteEditorForm } from './note-editor-form';
import { NotesListWithSearch } from './notes-list-with-search';
import { useNotesStore } from '../store';
import type { NoteEditorProps } from '../types';

export const NoteEditor = ({ video, currentTimestamp, onTimestampClick }: NoteEditorProps) => {
  const { setCurrentVideo, setCurrentTimestamp } = useNotesStore((state) => state);

  useEffect(() => {
    setCurrentVideo(video.id);
  }, [video.id, setCurrentVideo]);

  useEffect(() => {
    setCurrentTimestamp(currentTimestamp);
  }, [currentTimestamp, setCurrentTimestamp]);

  return (
    <div className="space-y-4">
      <NoteEditorForm />
      <NotesListWithSearch onTimestampClick={onTimestampClick} />
    </div>
  );
};
