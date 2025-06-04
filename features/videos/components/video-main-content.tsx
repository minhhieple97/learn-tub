import { VideoPlayerWrapper } from './video-player-wrapper';
import { VideoInfoCard } from './video-info-card';
import { VideoPageData } from '../types/video-page';

type VideoMainContentProps = {
  video: VideoPageData;
  videoId: string;
  onTimeUpdate: (time: number) => void;
  targetSeekTime?: number;
};

export const VideoMainContent = ({
  video,
  videoId,
  onTimeUpdate,
  targetSeekTime,
}: VideoMainContentProps) => {
  return (
    <div className="lg:col-span-2">
      <VideoPlayerWrapper
        videoId={videoId}
        onTimeUpdate={onTimeUpdate}
        targetSeekTime={targetSeekTime}
        initialTimestamp={0}
      />
      <VideoInfoCard video={video} />
    </div>
  );
};
