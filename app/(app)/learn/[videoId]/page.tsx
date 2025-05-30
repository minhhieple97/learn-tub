import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VideoPageClient } from "./video-page-client"

interface VideoPageProps {
  params: {
    videoId: string
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;
  const supabase = await createClient()

  // Check if video exists in database
  const { data: videos } = await supabase.from("videos").select("*, courses(title)").eq("youtube_id", videoId).limit(1)

  if (!videos || videos.length === 0) {
    notFound()
  }

  const video = videos[0]

  return <VideoPageClient video={video} videoId={videoId} />
}
