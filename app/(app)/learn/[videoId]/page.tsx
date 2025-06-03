import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VideoPageClient } from '@/features/videos/components';

type Course = {
  title: string;
};

export type Video = {
  id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  channel_name?: string | null;
  published_at?: string | null;
  courses?: Course | null;
};

type VideoPageProps = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, courses(title)')
    .eq('youtube_id', videoId)
    .limit(1);

  if (error) {
    console.error('Error fetching video:', error);
    notFound();
  }

  if (!videos || videos.length === 0) {
    notFound();
  }

  const video: Video = videos[0];

  return <VideoPageClient video={video} videoId={videoId} />;
}
