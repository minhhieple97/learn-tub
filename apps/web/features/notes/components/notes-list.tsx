import { NoteCard } from './note-card';
import { useNotesStore } from '../store';

type NotesListProps = {
  onTimestampClick?: (timestamp: number) => void;
};

export const NotesList = ({ onTimestampClick }: NotesListProps) => {
  const { isLoading, getDisplayNotes } = useNotesStore((state) => state);
  const displayNotes = getDisplayNotes();
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your Notes</h3>
        <p className="text-sm text-gray-500">Loading notes...</p>
      </div>
    );
  }

  if (displayNotes.length === 0) {
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
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {displayNotes.map((note) => (
          <NoteCard key={note.id} note={note} onTimestampClick={onTimestampClick} />
        ))}
      </div>
    </div>
  );
};
