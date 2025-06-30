import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNotesStore } from "../store";
import { useNotesQuery, useInvalidateNotes } from '../hooks/use-notes-queries';
import type { INote } from '../types';

type INoteCardActionsProps = {
  noteId: string;
  note: INote; // Pass the note data directly
};

export const NoteCardActions = ({ noteId, note }: INoteCardActionsProps) => {
  const { editingNote, startEditing, deleteNote, currentVideoId } = useNotesStore();
  const { invalidateByVideo, invalidateSearch } = useInvalidateNotes();

  const handleEdit = () => {
    startEditing(note);
  };

  const handleDelete = async () => {
    try {
      await deleteNote(noteId);

      // Invalidate queries to refetch data
      if (currentVideoId) {
        invalidateByVideo(currentVideoId);
        invalidateSearch(currentVideoId);
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
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
