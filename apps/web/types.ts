import {
  CHUNK_TYPES,
  CREDIT_ACTION_COUNTS,
  TRANSACTION_TYPES,
} from "@/config/constants";
import { Database, Tables } from "@/database.types";

export type DbProfile = Tables<"profiles">;
export type DbVideo = Tables<"videos">;
export type DbNote = Tables<"notes">;
export type DbQuizSession = Tables<"quiz_sessions">;
export type DbQuizAttempt = Tables<"quiz_attempts">;
export type DbCreditBucket = Tables<"credit_buckets">;
export type DbCreditTransaction = Tables<"credit_transactions">;
export type DbUserSubscription = Tables<"user_subscriptions">;
export type DbSubscriptionPlan = Tables<"subscription_plans">;
export type DbLearningSession = Tables<"learning_sessions">;
export type DbAiUsageLog = Tables<"ai_usage_logs">;
export type DbPaymentHistory = Tables<"payment_history">;

export type CreditSourceType =
  Database["public"]["Enums"]["credit_source_type_enum"];
export type CreditBucketStatus =
  Database["public"]["Enums"]["credit_bucket_status_enum"];
export type SubscriptionStatus =
  Database["public"]["Enums"]["subscription_status"];
export type TransactionType =
  Database["public"]["Enums"]["transaction_type_enum"];

export type StreamChunk = {
  type:
    | typeof CHUNK_TYPES.FEEDBACK
    | typeof CHUNK_TYPES.COMPLETE
    | typeof CHUNK_TYPES.ERROR;
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

export type ICreditTransactionType = TransactionType;

export type IUserProfile = DbProfile;

export type IProfileUpdate = Partial<
  Pick<DbProfile, "full_name" | "avatar_url" | "learning_preferences">
>;

export type IProfileSettings = DbProfile;

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

export type ITransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export type ICreditSourceType =
  Database["public"]["Enums"]["credit_source_type_enum"];

export type ICreditBucketStatus =
  Database["public"]["Enums"]["credit_bucket_status_enum"];
