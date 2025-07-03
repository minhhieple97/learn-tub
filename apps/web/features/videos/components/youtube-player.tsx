"use client";

import { useEffect, useRef } from "react";
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
import { useNotesStore } from "@/features/notes/store";
import { useLearningSession } from "../hooks/use-learning-session";
import { usePlayerControls } from "../hooks/use-player-controls";
import { IVideoPageData } from "../types";

type IYouTubePlayerProps = {
  initialTimestamp?: number;
};

export const YouTubePlayer = ({
  initialTimestamp = 0,
}: IYouTubePlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  const {
    youtubePlayer,
    playerState,
    duration,
    isApiLoaded,
    setYouTubePlayer,
    setPlayerState,
    setDuration,
    currentTime,
    isMuted,
    setVolume,
    setIsMuted,
    currentVideo,
    targetSeekTime,
    handleTimeUpdate,
  } = useNotesStore();

  useEffect(() => {
    if (!isApiLoaded || !playerRef.current || !window.YT) return;

    if (playerInstanceRef.current) {
      if (typeof playerInstanceRef.current.destroy === "function") {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = null;
      setYouTubePlayer(null);
    }

    const onPlayerReady = (event: any) => {
      const player = event.target;
      setYouTubePlayer(player);
      setDuration(player.getDuration());
      setVolume(player.getVolume());
      setIsMuted(player.isMuted());

      if (initialTimestamp > 0 && initialTimestamp < player.getDuration()) {
        player.seekTo(initialTimestamp, true);
      }
    };

    const onPlayerStateChange = (event: any) => {
      setPlayerState(event.data);
    };

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: currentVideo?.youtube_id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    playerInstanceRef.current = newPlayer;

    return () => {
      if (
        playerInstanceRef.current &&
        typeof playerInstanceRef.current.destroy === "function"
      ) {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = null;
      setYouTubePlayer(null);
    };
  }, [
    isApiLoaded,
    currentVideo?.youtube_id,
    initialTimestamp,
    setYouTubePlayer,
    setPlayerState,
    setDuration,
    setVolume,
    setIsMuted,
  ]);

  useLearningSession({
    player: youtubePlayer,
    videoId: currentVideo?.id!,
    playerState,
    initialTimestamp,
  });

  const {
    currentTime: controlsCurrentTime,
    isMuted: controlsIsMuted,
    handlePlayPause,
    handleSeek,
    toggleMute,
    skipForward,
    skipBackward,
  } = usePlayerControls({
    player: youtubePlayer,
    playerState,
    initialTimestamp,
    targetSeekTime,
    onTimeUpdate: handleTimeUpdate,
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isPlaying =
    typeof window !== "undefined" &&
    playerState === window.YT?.PlayerState?.PLAYING;
  const displayCurrentTime =
    controlsCurrentTime !== undefined ? controlsCurrentTime : currentTime;
  const displayIsMuted =
    controlsIsMuted !== undefined ? controlsIsMuted : isMuted;

  return (
    <Card className="w-full overflow-hidden">
      <div className="aspect-video bg-black">
        <div ref={playerRef} className="w-full h-full" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{formatTime(displayCurrentTime)}</span>
          <Slider
            value={[displayCurrentTime]}
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
              {displayIsMuted ? (
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
