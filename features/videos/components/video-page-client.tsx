'use client';

import { useVideoPlayer } from '@/features/videos/hooks/use-video-player';
import { VideoPageHeader } from './video-page-header';
import { VideoMainContent } from './video-main-content';
import { VideoSidebar } from './video-sidebar';
import { VideoPageData } from '../types/video-page';

type VideoPageClientProps = {
  video: VideoPageData;
};

export const VideoPageClient = ({ video }: VideoPageClientProps) => {
  const { currentTimestamp, targetSeekTime, handleTimeUpdate, handleNoteTimestampClick } =
    useVideoPlayer();

  return (
    <div className="space-y-6">
      <VideoPageHeader video={video} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VideoMainContent
          video={video}
          onTimeUpdate={handleTimeUpdate}
          targetSeekTime={targetSeekTime}
        />
        <div className="lg:col-span-1">
          <VideoSidebar
            video={video}
            currentTimestamp={currentTimestamp}
            onTimestampClick={handleNoteTimestampClick}
          />
        </div>
      </div>
    </div>
  );
};
