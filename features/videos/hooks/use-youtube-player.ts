import { useState, useEffect, useRef } from 'react';

type UseYouTubePlayerProps = {
  videoId: string;
  isApiLoaded: boolean;
  initialTimestamp?: number;
};

type UseYouTubePlayerReturn = {
  player: any;
  playerState: number;
  duration: number;
  playerRef: React.RefObject<HTMLDivElement | null>;
};

export const useYouTubePlayer = ({
  videoId,
  isApiLoaded,
  initialTimestamp = 0,
}: UseYouTubePlayerProps): UseYouTubePlayerReturn => {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isApiLoaded || !playerRef.current || player) return;

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
      videoId,
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

    return () => {
      if (newPlayer && typeof newPlayer.destroy === 'function') {
        newPlayer.destroy();
      }
      setPlayer(null);
    };
  }, [isApiLoaded, videoId, initialTimestamp]);

  return {
    player,
    playerState,
    duration,
    playerRef,
  };
}; 