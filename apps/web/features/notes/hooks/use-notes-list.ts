import { useNotesStore } from "@/features/notes/store";
import {
  useNotesQuery,
  useNotesSearch,
} from "@/features/notes/hooks/use-notes-queries";
import { INote } from "@/features/notes/types";
import { IVideoPageData } from "@/features/videos/types";

type INotesListData = {
  displayNotes: INote[] | undefined;
  isLoading: boolean;
  isEmpty: boolean;
  isSearchMode: boolean;
  searchQuery: string;
  currentVideo: IVideoPageData | null;
  emptyMessage: string;
};

export const useNotesList = (): INotesListData => {
  const currentVideo = useNotesStore((state) => state.currentVideo);
  const searchQuery = useNotesStore((state) => state.searchQuery);

  const { data: allNotes, isLoading: isLoadingNotes } = useNotesQuery(
    currentVideo?.id,
  );
  const { data: searchResults, isLoading: isSearching } = useNotesSearch(
    currentVideo?.id,
    searchQuery,
  );

  const isSearchMode = Boolean(searchQuery.trim());
  const displayNotes = isSearchMode ? searchResults : allNotes;
  const isLoading = isSearchMode ? isSearching : isLoadingNotes;

  const isEmpty = !displayNotes || displayNotes.length === 0;

  const emptyMessage = isSearchMode
    ? "No notes found matching your search."
    : "No notes yet. Start taking notes to see them here.";

  return {
    displayNotes,
    isLoading,
    isEmpty,
    isSearchMode,
    searchQuery,
    currentVideo,
    emptyMessage,
  };
};
