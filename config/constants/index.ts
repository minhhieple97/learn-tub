export const YOUTUBE_API = {
  BASE_URL: 'https://www.googleapis.com/youtube/v3/videos',
  THUMBNAIL_URL: 'https://img.youtube.com/vi',
  PARTS: 'snippet,contentDetails',
} as const;

export const YOUTUBE_PATTERNS = {
  URL_REGEX: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  DURATION_REGEX: /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
  VALID_URL_REGEX: /^https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?][^\s]*)?$/i,
} as const;

export const VIDEO_DEFAULTS = {
  TITLE: 'Untitled Video',
  DESCRIPTION: '',
  CHANNEL_NAME: 'Unknown Channel',
  DURATION: 0,
} as const;

export const TIME_UNITS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  HOURS_PER_DAY: 24,
  DAYS_PER_MONTH: 30,
} as const;

export const TOAST_MESSAGES = {
  VIDEO_ADDED_SUCCESS: 'Video added successfully!',
  VIDEO_EXISTS_ERROR: "You've already added this video",
  INVALID_URL_ERROR: 'Invalid YouTube URL',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  NOTE_SAVED_SUCCESS: 'Note saved successfully!',
  NOTE_UPDATED_SUCCESS: 'Note updated successfully!',
  NOTE_DELETED_SUCCESS: 'Note deleted successfully!',
  NOTE_SAVE_ERROR: 'Failed to save note. Please try again.',
  NOTE_UPDATE_ERROR: 'Failed to update note. Please try again.',
  NOTE_DELETE_ERROR: 'Failed to delete note. Please try again.',
  AUTH_ERROR: 'You must be logged in to perform this action',
} as const;
