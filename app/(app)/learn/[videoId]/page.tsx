import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VideoPageClient } from "./video-page-client"

// Define types here (ideally in a shared types file)
interface Course {
  title: string
}

export interface Video {
  id: string // Database ID
  youtube_id: string
  title: string
  description?: string | null
  channel_name?: string | null
  published_at?: string | null
  courses?: Course | null // Assuming a video can have one or zero courses
}

interface VideoPageProps {
  params: {
    videoId: string
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = params;
  const supabase = await createClient(); // Await the Supabase client initialization

  // Check if video exists in database
  const { data: videos, error } = await supabase // Now supabase is the client instance
    .from('videos')
    .select('*, courses(title)')
    .eq('youtube_id', videoId)
    .limit(1);

  if (error) {
    console.error('Error fetching video:', error);
    // Optionally, you could redirect to an error page or show a generic error
    notFound();
  }

  if (!videos || videos.length === 0) {
    notFound();
  }

  const video: Video = videos[0];

  return <VideoPageClient video={video} videoId={videoId} />;
}
