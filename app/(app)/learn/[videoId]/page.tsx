import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from 'next/navigation';
import { VideoPageClient } from '@/features/videos/components';
import { routes } from '@/routes';

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(routes.login);
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) {
    redirect(routes.login);
  }
  const { data: video, error } = await supabase
    .from('videos')
    .select('*, courses(title)')
    .eq('youtube_id', videoId)
    .eq('user_id', profile.id)
    .single();
  if (error) {
    console.error('Error fetching video:', error);
    notFound();
  }

  if (!video) {
    notFound();
  }

  return <VideoPageClient video={video} videoId={videoId} />;
}
