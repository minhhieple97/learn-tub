'use client';

import { use } from 'react';
import { VideoLibraryEmpty } from './video-library-empty';
import { VideoGrid } from './video-grid';
import { IVideo } from '../types';

type VideoLibraryProps = {
  videosPromise: Promise<IVideo[] | null>;
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
