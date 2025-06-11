/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';

type IUseYouTubePlayerProps = {
  youtubeId: string;
  isApiLoaded: boolean;
  initialTimestamp?: number;
};

type IUseYouTubePlayerReturn = {
  player: any;
  playerState: number;
  duration: number;
  playerRef: React.RefObject<HTMLDivElement | null>;
};

export const useYouTubePlayer = ({
  youtubeId,
  isApiLoaded,
  initialTimestamp = 0,
}: IUseYouTubePlayerProps): IUseYouTubePlayerReturn => {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isApiLoaded || !playerRef.current) return;

    if (playerInstanceRef.current) {
      if (typeof playerInstanceRef.current.destroy === 'function') {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = null;
      setPlayer(null);
    }

    const onPlayerReady = (event: any) => {
      setPlayer(event.target);
      setDuration(event.target.getDuration());
      if (initialTimestamp > 0 && initialTimestamp < event.target.getDuration()) {
        event.target.seekTo(initialTimestamp, true);
      }
    };

    const onPlayerStateChange = (event: any) => {
      setPlayerState(event.data);
    };

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: youtubeId,
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
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === 'function') {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = null;
      setPlayer(null);
    };
  }, [isApiLoaded, youtubeId, initialTimestamp]);

  return {
    player,
    playerState,
    duration,
    playerRef,
  };
};
