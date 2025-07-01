import { notFound } from "next/navigation";
import { VideoPageClient } from "@/features/videos/components";
import { getVideoPageData } from "@/features/videos/queries";
import getQueryClient from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchNotes } from "@/features/notes/hooks/use-notes-queries";

type IVideoPageProps = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function VideoPage({ params }: IVideoPageProps) {
  const { videoId } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["notes", videoId],
    queryFn: () => fetchNotes(videoId),
  });
  const dehydratedState = dehydrate(queryClient);
  const video = await getVideoPageData(videoId);

  if (!video) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <VideoPageClient video={video} />
    </HydrationBoundary>
  );
}
