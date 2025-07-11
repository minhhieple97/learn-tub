/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useNotesStore } from "@/features/notes/store";
import { usePlayerControls } from "./use-player-controls";

type IUseYouTubePlayerSetupProps = {
  initialTimestamp?: number;
};

type IUseYouTubePlayerSetupReturn = {
  playerRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  duration: number;
  handlePlayPause: () => void;
  handleSeek: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  formatTime: (seconds: number) => string;
};

export const useYouTubePlayerSetup = ({
  initialTimestamp = 0,
}: IUseYouTubePlayerSetupProps): IUseYouTubePlayerSetupReturn => {
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

  const {
    currentTime: controlsCurrentTime,
    volume: controlsVolume,
    isMuted: controlsIsMuted,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
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

  const displayVolume = controlsVolume !== undefined ? controlsVolume : 100;

  const displayIsMuted =
    controlsIsMuted !== undefined ? controlsIsMuted : isMuted;

  return {
    playerRef,
    currentTime: displayCurrentTime,
    volume: displayVolume,
    isMuted: displayIsMuted,
    isPlaying,
    duration,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skipForward,
    skipBackward,
    formatTime,
  };
};
