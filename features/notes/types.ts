import { AIProvider, IFeedback } from '@/types';
import { STATUS_STREAMING } from '@/config/constants';
import { IVideoPageData } from '../videos/types';

export type INote = {
  id: string;
  content: string;
  timestamp_seconds: number | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  video_id: string | null;
  user_id: string | null;
};

export type NoteEditorProps = {
  video: IVideoPageData;
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
  handleSaveNote: (note: INote) => void;
  handleUpdateNote: (note: INote) => void;
};

export type NoteEditorFormRef = {
  setEditingNote: (note: INote | null) => void;
};

export type TagsSectionProps = {
  onTagInputChange: (tagInput: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export type NotesListProps = {
  notes: INote[];
  onTimestampClick?: (timestamp: number) => void;
  onUpdateNote: (note: INote) => void;
  onDeleteNote: (noteId: string) => void;
};

export type NoteCardProps = {
  note: INote;
  onTimestampClick?: (timestamp: number) => void;
  onUpdateNote: (note: INote) => void;
  onDeleteNote: (noteId: string) => void;
};

export type ITimestampDisplayProps = {
  timestamp: number | null;
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
  notes: INote[];
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export type UseNotesFormReturn = {
  content: string;
  setContent: (content: string) => void;
  editingNoteId: string | null;
  setEditingNote: (note: INote | null) => void;
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
  setEditingNote: (note: INote | null) => void;
};

export type NotesSearchProps = {
  videoId?: string | null;
  onSearchResults?: (results: INote[]) => void;
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
  searchResults: INote[];
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

export type NoteEvaluationRequest = {
  noteId: string;
  content: string;
  provider: AIProvider;
  model: string;
  context?: {
    videoTitle?: string;
    videoDescription?: string;
    timestamp: number | null;
  };
};

export type NoteEvaluationResult = {
  id: string;
  note_id: string;
  user_id: string;
  provider: AIProvider;
  model: string;
  feedback: IFeedback;
  created_at: string;
};

export type NoteEvaluationResponse = {
  success: boolean;
  data?: NoteEvaluationResult;
  error?: string;
};

export type NoteEvaluationStatus =
  | typeof STATUS_STREAMING.IDLE
  | typeof STATUS_STREAMING.EVALUATING
  | typeof STATUS_STREAMING.STREAMING
  | typeof STATUS_STREAMING.COMPLETED
  | typeof STATUS_STREAMING.ERROR;
