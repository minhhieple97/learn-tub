import { NoteCard } from "./note-card";
import { NotesListSkeleton } from "./notes-list-skeleton";
import { useNotesList } from "@/features/notes/hooks/use-notes-list";

export const NotesList = () => {
  const { displayNotes, isLoading, isEmpty, emptyMessage } = useNotesList();

  if (isLoading) {
    return <NotesListSkeleton />;
  }

  if (isEmpty) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your Notes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Your Notes</h3>
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {displayNotes?.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};
