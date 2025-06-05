import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { NoteCardActionsProps } from '../types';
import { useNotesStore } from '../store';

export const NoteCardActions = ({ onEdit, onDelete, noteId }: NoteCardActionsProps) => {
  const { editingNote } = useNotesStore((state) => state);
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={onEdit} disabled={editingNote?.id === noteId}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} disabled={editingNote?.id === noteId}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
