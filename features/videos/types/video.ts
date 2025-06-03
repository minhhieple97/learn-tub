export type Video = {
  id: string;
  title: string;
  youtube_id: string;
  channel_name: string;
  created_at: string;
  duration: number;
  thumbnail_url?: string;
  user_id: string;
  notes?: Array<{ count: number }>;
};
