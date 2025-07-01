import { NoteCard } from "./note-card";
import { NotesListSkeleton } from "./notes-list-skeleton";
import { useNotesStore } from "../store";
import { useNotesQuery, useNotesSearch } from "../hooks/use-notes-queries";

type INotesListProps = {
  onTimestampClick?: (timestamp: number) => void;
};

export const NotesList = ({ onTimestampClick }: INotesListProps) => {
  const currentVideoId = useNotesStore((state) => state.currentVideoId);
  const searchQuery = useNotesStore((state) => state.searchQuery);

  const { data: allNotes, isLoading: isLoadingNotes } =
    useNotesQuery(currentVideoId);
  const { data: searchResults, isLoading: isSearching } = useNotesSearch(
    currentVideoId,
    searchQuery,
  );

  const displayNotes = searchQuery.trim() ? searchResults : allNotes;
  const isLoading = searchQuery.trim() ? isSearching : isLoadingNotes;

  if (isLoading) {
    return <NotesListSkeleton />;
  }

  if (!displayNotes || displayNotes.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your Notes</h3>
        <p className="text-sm text-gray-500">
          {searchQuery.trim()
            ? "No notes found matching your search."
            : "No notes yet. Start taking notes to see them here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Your Notes</h3>
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {displayNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onTimestampClick={onTimestampClick}
          />
        ))}
      </div>
    </div>
  );
};
