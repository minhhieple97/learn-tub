export type Course = {
  title: string;
};

export type VideoPageData = {
  id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  channel_name?: string | null;
  published_at?: string | null;
  courses?: Course | null;
};


export type VideoData = {
  userId: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  channelName: string;
  publishedAt: string | null;
};