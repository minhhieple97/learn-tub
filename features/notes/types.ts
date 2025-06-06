import { VideoPageData } from "../videos/types";

export type Note = {
  id: string;
  content: string;
  timestamp_seconds: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  video_id?: string;
  user_id?: string;
};

export type NoteEditorProps = {
  video: VideoPageData;
  currentTimestamp: number;
  onTimestampClick?: (time: number) => void;
};

export type CreateNotePayload = {
  video_id: string;
  user_id: string;
  content: string;
  timestamp_seconds: number;
  tags: string[];
};

export type UpdateNotePayload = {
  content: string;
  tags: string[];
  updated_at: string;
};

export type SaveNoteInput = {
  videoId: string;
  content: string;
  timestamp: number;
  tags: string[];
};

export type UpdateNoteInput = {
  noteId: string;
  content: string;
  tags: string[];
};

export type DeleteNoteInput = {
  noteId: string;
};

export type NoteActionResult = {
  success: boolean;
  noteId?: string;
  message?: string;
};

export type NoteEditorFormProps = {
  videoId: string;
  currentTimestamp: number;
  handleSaveNote: (note: Note) => void;
  handleUpdateNote: (note: Note) => void;
};

export type NoteEditorFormRef = {
  setEditingNote: (note: Note | null) => void;
};

export type TagsSectionProps = {
  onTagInputChange: (tagInput: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export type NotesListProps = {
  notes: Note[];
  onTimestampClick?: (timestamp: number) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
};

export type NoteCardProps = {
  note: Note;
  onTimestampClick?: (timestamp: number) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
};

export type TimestampDisplayProps = {
  timestamp: number;
  onClick?: (timestamp: number) => void;
  clickable?: boolean;
};

export type NoteCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  noteId: string;
};

export type NoteFormActionsProps = {
  isLoading: boolean;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

export type UseVideoIdReturn = {
  dbVideoId: string | null;
  isLoading: boolean;
};

export type UseNotesDataReturn = {
  notes: Note[];
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export type UseNotesFormReturn = {
  content: string;
  setContent: (content: string) => void;
  editingNoteId: string | null;
  setEditingNote: (note: Note | null) => void;
  resetForm: () => void;
  isEditing: boolean;
};

export type UseTagsReturn = {
  tags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  resetTags: () => void;
};

export type UseNotesOperationsReturn = {
  saveNote: (payload: SaveNoteInput) => void;
  updateNote: (payload: UpdateNoteInput) => void;
  deleteNote: (payload: DeleteNoteInput) => void;
  isLoading: boolean;
};

export type UseNoteEditorProps = {
  videoId: string;
  currentTimestamp: number;
};

export type UseNoteEditorReturn = {
  content: string;
  setContent: (content: string) => void;
  isEditing: boolean;
  
  tags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  
  isLoading: boolean;
  
  handleSave: () => void;
  handleCancel: () => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  setEditingNote: (note: Note | null) => void;
};

export type NotesSearchProps = {
  videoId?: string | null;
  onSearchResults?: (results: Note[]) => void;
  placeholder?: string;
  className?: string;
};

export type UseNotesSearchProps = {
  videoId?: string | null;
  enabled?: boolean;
};

export type UseNotesSearchReturn = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Note[];
  isSearching: boolean;
  clearSearch: () => void;
  hasResults: boolean;
  resultCount: number;
};

export type NotesListWithSearchProps = NotesListProps & {
  videoId: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
};
