import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type UseLearningSessionProps = {
  player: any;
  videoId: string;
  playerState: number;
  initialTimestamp: number;
};

export const useLearningSession = ({
  player,
  videoId,
  playerState,
  initialTimestamp,
}: UseLearningSessionProps) => {
  const supabase = createClient();

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
          : 0;
        const videoDuration = player.getDuration ? Math.floor(player.getDuration()) : 0;

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
  }, [player, playerState, videoId, supabase]);
}; 