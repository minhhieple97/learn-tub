import { YouTubePlayer } from './youtube-player';

type VideoPlayerWrapperProps = {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  targetSeekTime?: number;
  initialTimestamp?: number;
};

export function VideoPlayerWrapper({
  videoId,
  onTimeUpdate,
  targetSeekTime,
  initialTimestamp = 0,
}: VideoPlayerWrapperProps) {
  return (
    <YouTubePlayer
      videoId={videoId}
      onTimeUpdate={onTimeUpdate}
      targetSeekTime={targetSeekTime}
      initialTimestamp={initialTimestamp}
    />
  );
}
