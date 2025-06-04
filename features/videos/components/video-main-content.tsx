import { VideoPlayerWrapper } from './video-player-wrapper';
import { VideoInfoCard } from './video-info-card';
import { VideoPageData } from '../types/video-page';

type VideoMainContentProps = {
  video: VideoPageData;
  onTimeUpdate: (time: number) => void;
  targetSeekTime?: number;
};

export const VideoMainContent = ({
  video,
  onTimeUpdate,
  targetSeekTime,
}: VideoMainContentProps) => {
  return (
    <div className="lg:col-span-2">
      <VideoPlayerWrapper
        onTimeUpdate={onTimeUpdate}
        targetSeekTime={targetSeekTime}
        initialTimestamp={0}
        videoId={video.youtube_id}
      />
      <VideoInfoCard video={video} />
    </div>
  );
};
