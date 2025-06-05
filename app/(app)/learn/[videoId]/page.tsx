import { notFound, redirect } from 'next/navigation';
import { VideoPageClient } from '@/features/videos/components';
import { routes } from '@/routes';
import { getVideoPageData } from '@/features/videos/queries';

type VideoPageProps = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  const video = await getVideoPageData(videoId);

  if (!video) {
    notFound();
  }

  return <VideoPageClient video={video} />;
}
