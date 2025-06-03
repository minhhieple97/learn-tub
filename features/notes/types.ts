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
  videoId: string;
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

// Component Props Types
export type NoteEditorFormProps = {
  videoId: string;
  currentTimestamp: number;
};

export type TagsSectionProps = {
  tags: string[];
  tagInput: string;
  onTagInputChange: (tagInput: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export type NotesListProps = {
  notes: Note[];
  onTimestampClick?: (timestamp: number) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  formatTimestamp: (seconds: number) => string;
};

export type NoteCardProps = {
  note: Note;
  onTimestampClick?: (timestamp: number) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  formatTimestamp: (seconds: number) => string;
};

export type TimestampDisplayProps = {
  timestamp: number;
  onClick?: (timestamp: number) => void;
  formatTimestamp: (seconds: number) => string;
  clickable?: boolean;
};

export type NoteActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export type FormActionsProps = {
  isLoading: boolean;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
};

// Hook Types
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
  saveNote: (payload: { content: string; tags: string[]; timestamp: number }) => Promise<void>;
  updateNote: (id: string, payload: { content: string; tags: string[] }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
};
