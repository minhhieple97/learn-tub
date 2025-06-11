import { IYouTubeVideo, IAsyncOperationHook } from '@/types';

export type ICourse = {
  title: string;
};

export type IVideoPageData = {
  id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  channel_name?: string | null;
  published_at?: string | null;
  courses?: ICourse | null;
};

export type IVideoData = {
  userId: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  channelName: string;
  publishedAt: string | null;
};

export type IVideo = {
  id: string;
  title: string;
  youtube_id: string;
  channel_name: string | null;
  created_at: string | null;
  duration: number | null;
  thumbnail_url?: string | null;
  user_id: string;
  notes?: Array<{ count: number }>;
};

export type { IYouTubeVideo as IYouTubeVideoData } from '@/types';

export type IUseAddVideoFormReturn = {
  url: string;
  setUrl: (url: string) => void;
  isValidUrl: boolean;
  isPending: boolean;
  execute: (input: { videoUrl: string }) => void;
  canSubmit: boolean;
};
