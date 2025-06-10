'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useYouTubeAPI } from '../hooks/use-youtube-api';
import { useYouTubePlayer } from '../hooks/use-youtube-player';
import { useLearningSession } from '../hooks/use-learning-session';
import { usePlayerControls } from '../hooks/use-player-controls';
import { IVideoPageData } from '../types';

type YouTubePlayerProps = {
  video: IVideoPageData;
  initialTimestamp?: number;
  onTimeUpdate?: (time: number) => void;
  targetSeekTime?: number;
};

export const YouTubePlayer = ({
  video,
  initialTimestamp = 0,
  onTimeUpdate,
  targetSeekTime,
}: YouTubePlayerProps) => {
  const { isApiLoaded, YT } = useYouTubeAPI();

  const { player, playerState, duration, playerRef } = useYouTubePlayer({
    youtubeId: video.youtube_id,
    isApiLoaded,
    initialTimestamp,
  });

  useLearningSession({
    player,
    videoId: video.id,
    playerState,
    initialTimestamp,
  });

  const {
    currentTime,
    isMuted,
    handlePlayPause,
    handleSeek,
    toggleMute,
    skipForward,
    skipBackward,
  } = usePlayerControls({
    player,
    playerState,
    initialTimestamp,
    onTimeUpdate,
    targetSeekTime,
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isPlaying =
    typeof window !== 'undefined' && playerState === YT?.PlayerState?.PLAYING;

  return (
    <Card className="w-full overflow-hidden">
      <div className="aspect-video bg-black">
        <div ref={playerRef} className="w-full h-full" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
