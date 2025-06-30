/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Rich Text Editor Types
export type IScreenshotResult = {
  file: File;
  width: number;
  height: number;
  timestamp: number;
};

export type IUploadResult = {
  id: string;
  publicUrl: string;
  fileName: string;
  fileSize: number;
};

export type IRichTextEditorProps = {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  videoElement?: HTMLVideoElement | null;
  noteId?: string;
  userId: string;
  videoId: string;
  videoTitle?: string;
  disabled?: boolean;
};

export type IUseRichTextEditorProps = {
  initialContent?: string;
  onContentChange: (content: string) => void;
  videoId?: string;
  noteId?: string;
};

export type IUseRichTextEditorReturn = {
  editor: any; // TipTap Editor instance
  isUploading: boolean;
  uploadStatus: string;
  handleScreenshot: () => Promise<void>;
  handleImageUpload: (file: File) => Promise<void>;
  handleImagePaste: (event: ClipboardEvent) => Promise<void>;
  canTakeScreenshot: boolean;
  videoElement: HTMLVideoElement | null;
  setVideoElement: (element: HTMLVideoElement | null) => void;
};

export type IUseRichTextEditorHookReturn = {
  content: string;
  onContentChange: (content: string) => void;
  disabled: boolean;
  videoElement: HTMLVideoElement | null;
  setVideoElementRef: (element: HTMLVideoElement | null) => void;
  userId: string;
  videoId: string;
  isLoading: boolean;
  isReady: boolean;
};

// Database Types
export type IMediaFile = {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'image' | 'video_screenshot';
  file_size: number;
  mime_type: string;
  storage_path: string;
  public_url: string | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type IVideoScreenshot = {
  id: string;
  media_file_id: string;
  video_id: string;
  user_id: string;
  timestamp_seconds: number;
  youtube_timestamp: string | null;
  video_title: string | null;
  video_thumbnail_url: string | null;
  created_at: string;
};

export type INoteMedia = {
  id: string;
  note_id: string;
  media_file_id: string;
  position_in_content: number | null;
  created_at: string;
};

// Extended Note Type with Rich Content
export type IRichNote = INote & {
  content_type: 'plain_text' | 'rich_text';
  rich_content: Record<string, any> | null;
  content_version: number;
};

// API Request/Response Types
export type ILinkScreenshotToNoteRequest = {
  mediaFileId: string;
  position?: number;
};

export type IMediaUploadFormData = {
  file: File;
  fileType?: 'image' | 'video_screenshot';
  videoId?: string;
  timestamp?: string;
  videoTitle?: string;
};

export type IMediaUploadResponse = {
  success: boolean;
  data: {
    id: string;
    publicUrl: string;
    fileName: string;
    fileSize: number;
    mediaFileId: string;
  };
};

export type INoteMediaResponse = {
  success: boolean;
  data: (INoteMedia & {
    media_files: IMediaFile;
  })[];
};
