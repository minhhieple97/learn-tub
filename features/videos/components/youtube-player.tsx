"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { createClient } from '@/lib/supabase/client';

interface YouTubePlayerProps {
  videoId: string;
  initialTimestamp?: number;
  onTimeUpdate?: (time: number) => void;
  targetSeekTime?: number;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function YouTubePlayer({
  videoId,
  initialTimestamp = 0,
  onTimeUpdate,
  targetSeekTime,
}: YouTubePlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [currentTime, setCurrentTime] = useState(initialTimestamp);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true);
      };
    } else {
      setIsApiLoaded(true);
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Initialize player when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !playerRef.current || player) return;

    const onPlayerReady = (event: any) => {
      setPlayer(event.target);
      setDuration(event.target.getDuration());
      if (initialTimestamp > 0 && initialTimestamp < event.target.getDuration()) {
        event.target.seekTo(initialTimestamp, true);
      }
      setVolume(event.target.getVolume());
      setIsMuted(event.target.isMuted());
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
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (newPlayer && typeof newPlayer.destroy === 'function') {
        newPlayer.destroy();
      }
      setPlayer(null);
    };
  }, [isApiLoaded, videoId]);

  // Effect for time updates using player state
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

  // Effect to handle external seek requests
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

  // Track learning session (Initial session creation or update last_accessed_at)
  useEffect(() => {
    if (!player || !videoId) return;

    const trackInitialSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: videos } = await supabase
          .from('videos')
          .select('id')
          .eq('youtube_id', videoId)
          .single();
        if (!videos) {
          console.error('Video not found in DB for session tracking:', videoId);
          return;
        }
        const videoDbId = videos.id;

        const { data: existingSession, error: fetchError } = await supabase
          .from('learning_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', videoDbId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing session:', fetchError);
          return;
        }

        if (existingSession) {
          await supabase
            .from('learning_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingSession.id);
        } else {
          const playerDuration = player.getDuration ? Math.floor(player.getDuration()) : 0;
          await supabase.from('learning_sessions').insert({
            user_id: user.id,
            video_id: videoDbId,
            duration_seconds: Math.max(playerDuration, 0),
            progress_seconds: Math.floor(initialTimestamp),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error tracking initial session:', error);
      }
    };

    if (player && typeof player.getDuration === 'function') {
      trackInitialSession();
    }
  }, [player, videoId, supabase, initialTimestamp]);

  // Update session progress periodically
  useEffect(() => {
    if (
      !player ||
      (typeof window !== 'undefined' && playerState !== window.YT?.PlayerState?.PLAYING)
    ) {
      return;
    }

    const updateProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: videoInfo } = await supabase
          .from('videos')
          .select('id')
          .eq('youtube_id', videoId)
          .single();
        if (!videoInfo) return;

        const videoDbId = videoInfo.id;
        const currentVideoTime = player.getCurrentTime
          ? Math.floor(player.getCurrentTime())
          : currentTime;
        const videoDuration = player.getDuration ? Math.floor(player.getDuration()) : duration;

        await supabase
          .from('learning_sessions')
          .update({
            progress_seconds: currentVideoTime,
            duration_seconds: Math.max(videoDuration, 0),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('video_id', videoDbId);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    const progressInterval = setInterval(updateProgress, 30000);

    return () => {
      clearInterval(progressInterval);
    };
  }, [player, playerState, videoId, supabase, currentTime, duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
    if (onTimeUpdate) {
      onTimeUpdate(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!player || typeof player.setVolume !== 'function') return;
    const newVolume = value[0];
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
    const videoDuration = player.getDuration ? player.getDuration() : duration;
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
              {typeof window !== 'undefined' && playerState === window.YT?.PlayerState?.PLAYING ? (
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
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
