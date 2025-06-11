import { AI_PROVIDERS, CHUNK_TYPES } from './config/constants';

export type AIProvider =
  | typeof AI_PROVIDERS.OPENAI
  | typeof AI_PROVIDERS.GEMINI;

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
  data: T;
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
