"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface YouTubePlayerProps {
  videoId: string
  initialTimestamp?: number
  onTimeUpdate?: (time: number) => void
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export function YouTubePlayer({ videoId, initialTimestamp = 0, onTimeUpdate }: YouTubePlayerProps) {
  const [player, setPlayer] = useState<any>(null)
  const [playerState, setPlayerState] = useState(-1)
  const [currentTime, setCurrentTime] = useState(initialTimestamp)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isApiLoaded, setIsApiLoaded] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true)
      }
    } else {
      setIsApiLoaded(true)
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
    }
  }, [])

  // Initialize player when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !playerRef.current) return

    const onPlayerReady = (event: any) => {
      setDuration(event.target.getDuration())
      if (initialTimestamp > 0) {
        event.target.seekTo(initialTimestamp)
      }
      setVolume(event.target.getVolume())
      setIsMuted(event.target.isMuted())
    }

    const onPlayerStateChange = (event: any) => {
      setPlayerState(event.data)
    }

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
        start: initialTimestamp,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })

    setPlayer(newPlayer)

    // Set up interval to track current time
    timeUpdateIntervalRef.current = setInterval(() => {
      if (newPlayer && newPlayer.getCurrentTime) {
        const time = Math.floor(newPlayer.getCurrentTime())
        setCurrentTime(time)
        if (onTimeUpdate) {
          onTimeUpdate(time)
        }
      }
    }, 1000)

    // Track learning session
    const trackSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get video from database
          const { data: videos } = await supabase.from("videos").select("id").eq("youtube_id", videoId).limit(1)

          if (videos && videos.length > 0) {
            const videoDbId = videos[0].id

            // Check if session exists
            const { data: existingSessions } = await supabase
              .from("learning_sessions")
              .select("id")
              .eq("user_id", user.id)
              .eq("video_id", videoDbId)
              .limit(1)

            if (existingSessions && existingSessions.length > 0) {
              // Update existing session
              await supabase
                .from("learning_sessions")
                .update({
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingSessions[0].id)
            } else {
              // Create new session
              await supabase.from("learning_sessions").insert({
                user_id: user.id,
                video_id: videoDbId,
                duration_seconds: 0,
                progress_seconds: 0,
              })
            }
          }
        }
      } catch (error) {
        console.error("Error tracking session:", error)
      }
    }

    trackSession()

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
      if (newPlayer && newPlayer.destroy) {
        newPlayer.destroy()
      }
    }
  }, [isApiLoaded, videoId, initialTimestamp, onTimeUpdate])

  // Update session progress periodically
  useEffect(() => {
    const updateProgress = async () => {
      if (!player || playerState !== window.YT.PlayerState.PLAYING) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get video from database
          const { data: videos } = await supabase.from("videos").select("id").eq("youtube_id", videoId).limit(1)

          if (videos && videos.length > 0) {
            const videoDbId = videos[0].id

            // Update session progress
            await supabase
              .from("learning_sessions")
              .update({
                progress_seconds: currentTime,
                duration_seconds: Math.max(duration, 0),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .eq("video_id", videoDbId)
          }
        }
      } catch (error) {
        console.error("Error updating progress:", error)
      }
    }

    // Update progress every 30 seconds
    const progressInterval = setInterval(updateProgress, 30000)

    return () => {
      clearInterval(progressInterval)
    }
  }, [player, playerState, currentTime, duration, videoId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePlayPause = () => {
    if (!player) return

    if (playerState === window.YT.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSeek = (value: number[]) => {
    if (!player) return
    const newTime = value[0]
    player.seekTo(newTime)
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!player) return
    const newVolume = value[0]
    player.setVolume(newVolume)
    setVolume(newVolume)
    if (newVolume === 0) {
      player.mute()
      setIsMuted(true)
    } else if (isMuted) {
      player.unMute()
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (!player) return
    if (isMuted) {
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }

  const skipForward = () => {
    if (!player) return
    const newTime = Math.min(currentTime + 10, duration)
    player.seekTo(newTime)
    setCurrentTime(newTime)
  }

  const skipBackward = () => {
    if (!player) return
    const newTime = Math.max(currentTime - 10, 0)
    player.seekTo(newTime)
    setCurrentTime(newTime)
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="aspect-video bg-black">
        <div ref={playerRef} className="w-full h-full" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <Slider value={[currentTime]} min={0} max={duration} step={1} onValueChange={handleSeek} className="flex-1" />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePlayPause}>
              {playerState === window.YT.PlayerState.PLAYING ? (
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
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
