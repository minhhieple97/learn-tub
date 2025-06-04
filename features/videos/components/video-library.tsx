'use client';

import { use } from 'react';
import { VideoLibraryEmpty } from './video-library-empty';
import { VideoGrid } from './video-grid';
import { Video } from '@/features/videos/types/video';

type VideoLibraryProps = {
  videosPromise: Promise<Video[] | null>;
};

export const VideoLibrary = ({ videosPromise }: VideoLibraryProps) => {
  const videos = use(videosPromise);

  if (!videos || videos.length === 0) {
    return <VideoLibraryEmpty />;
  }

  return (
    <div className="space-y-10">
      <VideoGrid videos={videos} />
    </div>
  );
};
