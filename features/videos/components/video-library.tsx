"use client"

import { useVideos } from '@/hooks/use-videos';
import { VideoLibrarySkeleton } from './video-library-skeleton';
import { VideoLibraryError } from './video-library-error';
import { VideoLibraryEmpty } from './video-library-empty';
import { VideoGrid } from './video-grid';

export function VideoLibrary() {
  const { videos, loading, error } = useVideos();

  if (loading) {
    return <VideoLibrarySkeleton />;
  }

  if (error) {
    return <VideoLibraryError error={error} />;
  }

  if (!videos || videos.length === 0) {
    return <VideoLibraryEmpty />;
  }

  return (
    <div className="space-y-10">
      <VideoGrid videos={videos} />
    </div>
  );
}
