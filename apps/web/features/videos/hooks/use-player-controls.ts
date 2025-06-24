import { useState, useEffect, useRef } from 'react';

type IUsePlayerControlsProps = {
  player: any;
  playerState: number;
  initialTimestamp?: number;
  onTimeUpdate?: (time: number) => void;
  targetSeekTime?: number;
};

type IUsePlayerControlsReturn = {
  currentTime: number;
  volume: number;
  isMuted: boolean;
  handlePlayPause: () => void;
  handleSeek: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  skipForward: () => void;
  skipBackward: () => void;
};

export const usePlayerControls = ({
  player,
  playerState,
  initialTimestamp = 0,
  onTimeUpdate,
  targetSeekTime,
}: IUsePlayerControlsProps): IUsePlayerControlsReturn => {
  const [currentTime, setCurrentTime] = useState<number>(initialTimestamp);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (player && typeof player.getVolume === 'function') {
      setVolume(player.getVolume());
      setIsMuted(player.isMuted());
    }
  }, [player]);

  useEffect(() => {
    if (player && typeof player.getCurrentTime === 'function') {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }

      timeUpdateIntervalRef.current = setInterval(() => {
        const time = player.getCurrentTime();
        if (time !== undefined) {
          const flooredTime = Math.floor(time);
          setCurrentTime(flooredTime);
          if (onTimeUpdate) {
            onTimeUpdate(flooredTime);
          }
        }
      }, 1000);
    }
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [player, onTimeUpdate]);

  useEffect(() => {
    if (
      player &&
      typeof targetSeekTime === 'number' &&
      targetSeekTime >= 0 &&
      typeof player.seekTo === 'function'
    ) {
      const currentVideoTime = Math.floor(player.getCurrentTime() || 0);
      if (targetSeekTime !== currentVideoTime) {
        player.seekTo(targetSeekTime, true);
        setCurrentTime(targetSeekTime);
      }
    }
  }, [player, targetSeekTime]);

  const handlePlayPause = () => {
    if (
      !player ||
      typeof player.playVideo !== 'function' ||
      typeof player.pauseVideo !== 'function'
    )
      return;

    if (playerState === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!player || typeof player.seekTo !== 'function') return;
    const newTime = value[0];
    if (newTime === undefined) return;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
    if (onTimeUpdate) {
      onTimeUpdate(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!player || typeof player.setVolume !== 'function') return;
    const newVolume = value[0];
    if (newVolume === undefined) return;
    player.setVolume(newVolume);
    setVolume(newVolume);
    if (newVolume === 0) {
      player.mute();
      setIsMuted(true);
    } else if (isMuted) {
      player.unMute();
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!player || typeof player.mute !== 'function' || typeof player.unMute !== 'function') return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    if (!player || typeof player.seekTo !== 'function' || typeof player.getDuration !== 'function')
      return;
    const currentVideoTime = player.getCurrentTime ? player.getCurrentTime() : currentTime;
    const videoDuration = player.getDuration ? player.getDuration() : 0;
    const newTime = Math.min(currentVideoTime + 10, videoDuration);
    player.seekTo(newTime, true);
    setCurrentTime(Math.floor(newTime));
    if (onTimeUpdate) {
      onTimeUpdate(Math.floor(newTime));
    }
  };

  const skipBackward = () => {
    if (!player || typeof player.seekTo !== 'function') return;
    const currentVideoTime = player.getCurrentTime ? player.getCurrentTime() : currentTime;
    const newTime = Math.max(currentVideoTime - 10, 0);
    player.seekTo(newTime, true);
    setCurrentTime(Math.floor(newTime));
    if (onTimeUpdate) {
      onTimeUpdate(Math.floor(newTime));
    }
  };

  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    volume,
    isMuted,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skipForward,
    skipBackward,
  };
}; 