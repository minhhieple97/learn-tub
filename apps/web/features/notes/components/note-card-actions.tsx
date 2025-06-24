import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useNotesStore } from '../store';

type INoteCardActionsProps = {
  noteId: string;
};

export const NoteCardActions = ({ noteId }: INoteCardActionsProps) => {
  const { editingNote, startEditing, deleteNote, notes } = useNotesStore();

  const currentNote = notes.find((note) => note.id === noteId);

  const handleEdit = () => {
    if (currentNote) {
      startEditing(currentNote);
    }
  };

  const handleDelete = () => {
    deleteNote(noteId);
  };

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={handleEdit} disabled={editingNote?.id === noteId}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={editingNote?.id === noteId}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
