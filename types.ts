import {
  AI_COMMANDS,
  CHUNK_TYPES,
  CREDIT_ACTION_COUNTS,
  TRANSACTION_TYPES,
} from '@/config/constants';
import { Database } from '@/database.types';

export type StreamChunk = {
  type: typeof CHUNK_TYPES.FEEDBACK | typeof CHUNK_TYPES.COMPLETE | typeof CHUNK_TYPES.ERROR;
  content: string;
  finished?: boolean;
};

export type IFeedback = {
  summary: string;
  correct_points: string[];
  incorrect_points: string[];
  improvement_suggestions: string[];
  overall_score: number;
  detailed_analysis: string;
};

export type IYouTubeVideo = {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  contentDetails: {
    duration: string;
  };
};

// Common generic types for better reusability
export type IApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type IActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type IAsyncHookReturn<T = unknown> = {
  data?: T;
  isLoading: boolean;
  error?: string | null;
};

export type IAsyncOperationHook = {
  isLoading: boolean;
  error?: string | null;
};

export type IPaginatedResponse<T = unknown> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ISearchHookReturn<T = unknown> = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: T[];
  isSearching: boolean;
  clearSearch: () => void;
  hasResults: boolean;
  resultCount: number;
};

export type ICreditActionCount = typeof CREDIT_ACTION_COUNTS;

export type ICreditTransactionType = Database['public']['Enums']['transaction_type_enum'];

// Profile management types
export type IProfileUpdate = {
  full_name?: string;
  avatar_url?: string;
};

export type IProfileSettings = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type IProfileFormData = {
  full_name: string;
  avatar_url?: string;
};

export type IProfileHookReturn = IAsyncHookReturn<IProfileSettings> & {
  updateProfile: (data: IProfileUpdate) => Promise<void>;
  isUpdating: boolean;
  updateError?: string | null;
};

export type IFileUploadResult = {
  url: string;
  error?: string;
};

export type IAvatarUploadHookReturn = {
  uploadAvatar: (file: File) => Promise<IFileUploadResult>;
  isUploading: boolean;
  uploadError?: string | null;
};

export {};
