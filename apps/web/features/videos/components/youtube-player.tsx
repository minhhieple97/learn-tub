"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useYouTubePlayerSetup } from "../hooks/use-youtube-player-setup";

type IYouTubePlayerProps = {
  initialTimestamp?: number;
};

export const YouTubePlayer = ({
  initialTimestamp = 0,
}: IYouTubePlayerProps) => {
  const {
    playerRef,
    currentTime,
    volume,
    isMuted,
    isPlaying,
    duration,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skipForward,
    skipBackward,
    formatTime,
  } = useYouTubePlayerSetup({ initialTimestamp });

  return (
    <Card className="w-full overflow-hidden">
      <div className="aspect-video bg-black">
        <div ref={playerRef} className="w-full h-full" />
      </div>
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
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

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
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

          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">
              {isMuted ? 0 : Math.round(volume)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
