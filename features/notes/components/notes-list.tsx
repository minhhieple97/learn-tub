import { NoteCard } from './note-card';
import type { NotesListProps } from '../types';

export function NotesList({
  notes,
  onTimestampClick,
  onEditNote,
  onDeleteNote,
  formatTimestamp,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your Notes</h3>
        <p className="text-sm text-gray-500">No notes yet. Start taking notes to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Your Notes</h3>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onTimestampClick={onTimestampClick}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          formatTimestamp={formatTimestamp}
        />
      ))}
    </div>
  );
}
