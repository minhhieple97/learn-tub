import { IVideoPageData } from "../types";
import { VideoInfoCard } from "./video-info-card";
import { YouTubePlayer } from "./youtube-player";

type VideoMainContentProps = {
  video: IVideoPageData;
  onTimeUpdate: (time: number) => void;
  targetSeekTime?: number;
};

export const VideoMainContent = ({
  video,
  onTimeUpdate,
  targetSeekTime,
}: VideoMainContentProps) => {
  return (
    <div className="space-y-4">
      <YouTubePlayer
        video={video}
        onTimeUpdate={onTimeUpdate}
        targetSeekTime={targetSeekTime}
        initialTimestamp={0}
      />
      <VideoInfoCard video={video} />
    </div>
  );
};
