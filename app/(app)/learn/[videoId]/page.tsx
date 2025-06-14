import { notFound } from "next/navigation";
import { VideoPageClient } from "@/features/videos/components";
import { getVideoPageData } from "@/features/videos/queries";

type IVideoPageProps = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function VideoPage({ params }: IVideoPageProps) {
  const { videoId } = await params;

  const video = await getVideoPageData(videoId);

  if (!video) {
    notFound();
  }

  return <VideoPageClient video={video} />;
}
