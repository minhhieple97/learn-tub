export const MEDIA_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  STORAGE_BUCKET: 'note-media',
  CACHE_CONTROL: '3600',
  PATH_PREFIX: 'media',
} as const;

export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO_SCREENSHOT: 'video_screenshot',
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const MEDIA_SOURCES = {
  USER_UPLOAD: 'user_upload',
  YOUTUBE_VIDEO: 'youtube_video',
} as const;

export const RICH_TEXT_EDITOR = {
  MIN_HEIGHT: 120,
  SCREENSHOT_QUALITY: 0.95,
  PROSE_CLASSES:
    'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-4',
  IMAGE_CLASSES:
    'relative inline-block rounded-lg max-w-32 h-auto cursor-pointer hover:opacity-80 transition-opacity group',
  ACCEPTED_IMAGE_TYPES: 'image/*',
} as const;

export const KEYBOARD_SHORTCUTS = {
  SCREENSHOT: 'Ctrl+Shift+S',
  PASTE_IMAGE: 'Ctrl+V',
} as const;

export const TOAST_MESSAGES = {
  SCREENSHOT_SUCCESS: 'Screenshot captured and inserted!',
  SCREENSHOT_ERROR: 'Failed to capture screenshot',
  SCREENSHOT_NOT_READY: 'Video not ready for screenshot',
  IMAGE_UPLOAD_SUCCESS: 'Image uploaded successfully!',
  IMAGE_UPLOAD_ERROR: 'Failed to upload image',
  IMAGE_PASTE_SUCCESS: 'Image pasted successfully!',
  IMAGE_PASTE_ERROR: 'Failed to paste image',
  IMAGE_DELETE_SUCCESS: 'Image deleted successfully!',
  IMAGE_DELETE_ERROR: 'Failed to delete image',
  INVALID_FILE_TYPE: 'Please select an image file',
  FILE_TOO_LARGE: 'Image size must be less than 5MB',
} as const;
