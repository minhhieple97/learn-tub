import { VideoInfoCard } from "./video-info-card";
import { YouTubePlayer } from "./youtube-player";
export const VideoMainContent = () => {
  return (
    <div className="space-y-4">
      <YouTubePlayer initialTimestamp={0} />
      <VideoInfoCard />
    </div>
  );
};
