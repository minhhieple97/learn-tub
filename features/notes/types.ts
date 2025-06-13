import {
  IFeedback,
  IApiResponse,
  IActionResult,
  IAsyncHookReturn,
  IAsyncOperationHook,
  ISearchHookReturn,
} from '@/types';
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

export type INoteEditorProps = {
  video: IVideoPageData;
  currentTimestamp: number;
  onTimestampClick?: (time: number) => void;
};

export type ICreateNotePayload = {
  video_id: string;
  user_id: string;
  content: string;
  timestamp_seconds: number;
  tags: string[];
};

export type IUpdateNotePayload = {
  content: string;
  tags: string[];
  updated_at: string;
};

export type ISaveNoteInput = {
  videoId: string;
  content: string;
  timestamp: number;
  tags: string[];
};

export type IUpdateNoteInput = {
  noteId: string;
  content: string;
  tags: string[];
};

export type IDeleteNoteInput = {
  noteId: string;
};

export type INoteActionResult = IActionResult<string>;

export type INoteEditorFormProps = {
  videoId: string;
  currentTimestamp: number;
  handleSaveNote: (note: INote) => void;
  handleUpdateNote: (note: INote) => void;
};

export type INoteEditorFormRef = {
  setEditingNote: (note: INote | null) => void;
};

export type ITagsSectionProps = {
  onTagInputChange: (tagInput: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export type INotesListProps = {
  notes: INote[];
  onTimestampClick?: (timestamp: number) => void;
  onUpdateNote: (note: INote) => void;
  onDeleteNote: (noteId: string) => void;
};

export type INoteCardProps = {
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

export type INoteCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  noteId: string;
};

export type INoteFormActionsProps = {
  isLoading: boolean;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

export type IUseVideoIdReturn = IAsyncHookReturn<string | null>;

export type IUseNotesDataReturn = {
  notes: INote[];
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export type IUseNotesFormReturn = {
  content: string;
  setContent: (content: string) => void;
  editingNoteId: string | null;
  setEditingNote: (note: INote | null) => void;
  resetForm: () => void;
  isEditing: boolean;
};

export type IUseTagsReturn = {
  tags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  resetTags: () => void;
};

export type IUseNotesOperationsReturn = IAsyncOperationHook & {
  saveNote: (payload: ISaveNoteInput) => void;
  updateNote: (payload: IUpdateNoteInput) => void;
  deleteNote: (payload: IDeleteNoteInput) => void;
};

export type IUseNoteEditorProps = {
  videoId: string;
  currentTimestamp: number;
};

export type IUseNoteEditorReturn = {
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

export type INotesSearchProps = {
  videoId?: string | null;
  onSearchResults?: (results: INote[]) => void;
  placeholder?: string;
  className?: string;
};

export type IUseNotesSearchProps = {
  videoId?: string | null;
  enabled?: boolean;
};

export type IUseNotesSearchReturn = ISearchHookReturn<INote>;

export type INotesListWithSearchProps = INotesListProps & {
  videoId: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
};

export type INoteEvaluationRequest = {
  noteId: string;
  content: string;
  aiModelId: string;
  userId: string;
  context?: {
    videoTitle?: string;
    videoDescription?: string;
    timestamp: number | null;
  };
};

export type INoteEvaluationResult = {
  id: string;
  note_id: string;
  user_id: string;
  provider: string | null;
  model: string;
  feedback: IFeedback;
  created_at: string;
};

export type INoteEvaluationResponse = IApiResponse<INoteEvaluationResult>;

export type INoteEvaluationStatus =
  | typeof STATUS_STREAMING.IDLE
  | typeof STATUS_STREAMING.EVALUATING
  | typeof STATUS_STREAMING.STREAMING
  | typeof STATUS_STREAMING.COMPLETED
  | typeof STATUS_STREAMING.ERROR;
