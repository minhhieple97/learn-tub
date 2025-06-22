export const AUTH_API_ENDPOINTS = {
  USER_PROFILE: '/api/user/profile',
} as const;

export const USER_PROFILE_QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
  RETRY_COUNT: 2,
} as const;

export const USER_PROFILE_QUERY_KEY = ['userProfile'] as const;

export const AVATAR_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  CACHE_CONTROL: '3600',
  STORAGE_BUCKET: 'avatars',
} as const;

export const AUTH_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized: Please sign in to continue',
  UNAUTHORIZED_UPLOAD: 'Unauthorized: Please sign in to upload avatar',
  UNAUTHORIZED_UPDATE: 'Unauthorized: Please sign in to update your profile',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Only JPEG, PNG, GIF, and WebP images are allowed',
  UPLOAD_FAILED: 'Failed to upload avatar',
  UPDATE_FAILED: 'Failed to update profile',
  UPDATE_AVATAR_FAILED: 'Failed to update profile with new avatar',
  ACCOUNT_CREATION_FAILED: 'Failed to create user account',
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  AVATAR_UPLOADED: 'Avatar uploaded successfully',
} as const;
