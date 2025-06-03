import { Button } from '@/components/ui/button';
import type { NoteActionsProps } from '../types';

export function NoteActions({ onEdit, onDelete }: NoteActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
