import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLearningSession,
  createOrUpdateSession,
  updateSessionProgress,
} from "../queries-client/learning-sessions";
import { learningSessionKeys } from "../utils/learning-session-keys";

type IUseLearningSessionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any;
  videoId: string;
  playerState: number;
  initialTimestamp: number;
}

interface PlayerMethods {
  getCurrentTime?: () => number;
  getDuration?: () => number;
}

export const useLearningSession = ({
  player,
  videoId,
  playerState,
  initialTimestamp,
}: IUseLearningSessionProps) => {
  const queryClient = useQueryClient();

  const {
    data: learningSession,
    isLoading,
    error,
  } = useQuery({
    queryKey: learningSessionKeys.session(videoId),
    queryFn: () => getLearningSession(videoId),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const createSessionMutation = useMutation({
    mutationFn: createOrUpdateSession,
    onSuccess: (data) => {
      queryClient.setQueryData(learningSessionKeys.session(videoId), data);
    },
    onError: (error) => {
      console.error('Error creating/updating session:', error);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: updateSessionProgress,
    onSuccess: (data) => {
      queryClient.setQueryData(learningSessionKeys.session(videoId), data);
    },
    onError: (error) => {
      console.error('Error updating session progress:', error);
    },
  });

  const getPlayerData = useCallback((): {
    currentTime: number;
    duration: number;
  } => {
    const typedPlayer = player as PlayerMethods;
    const currentTime = typedPlayer.getCurrentTime ? Math.floor(typedPlayer.getCurrentTime()) : 0;
    const duration = typedPlayer.getDuration ? Math.floor(typedPlayer.getDuration()) : 0;

    return {
      currentTime,
      duration: Math.max(duration, 0),
    };
  }, [player]);

  useEffect(() => {
    if (!player || !videoId || createSessionMutation.isPending) return;

    const trackInitialSession = async () => {
      try {
        const { currentTime, duration } = getPlayerData();

        const sessionData = {
          video_id: videoId,
          duration_seconds: duration,
          progress_seconds: Math.floor(initialTimestamp) || currentTime,
        };

        await createSessionMutation.mutateAsync(sessionData);
      } catch (error) {
        console.error('Error tracking initial session:', error);
      }
    };

    if (player && typeof player.getDuration === 'function') {
      trackInitialSession();
    }
  }, [player, videoId, initialTimestamp, createSessionMutation, getPlayerData]);

  useEffect(() => {
    const isPlaying =
      typeof window !== 'undefined' && playerState === window.YT?.PlayerState?.PLAYING;

    if (!player || !isPlaying || updateProgressMutation.isPending) {
      return;
    }

    const updateProgress = async () => {
      try {
        const { currentTime, duration } = getPlayerData();

        const updateData = {
          video_id: videoId,
          progress_seconds: currentTime,
          duration_seconds: duration,
        };

        await updateProgressMutation.mutateAsync(updateData);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    const progressInterval = setInterval(updateProgress, 30000);

    return () => {
      clearInterval(progressInterval);
    };
  }, [player, playerState, videoId, updateProgressMutation, getPlayerData]);

  useEffect(() => {
    const isEnded = typeof window !== 'undefined' && playerState === window.YT?.PlayerState?.ENDED;

    if (!isEnded || !player || updateProgressMutation.isPending) return;

    const markCompleted = async () => {
      try {
        const { duration } = getPlayerData();

        const updateData = {
          video_id: videoId,
          progress_seconds: duration,
          duration_seconds: duration,
          completed: true,
        };

        await updateProgressMutation.mutateAsync(updateData);
      } catch (error) {
        console.error('Error marking session as completed:', error);
      }
    };

    markCompleted();
  }, [playerState, player, videoId, updateProgressMutation, getPlayerData]);

  return {
    learningSession,
    isLoading,
    error,
    isCreatingSession: createSessionMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
    createSessionError: createSessionMutation.error,
    updateProgressError: updateProgressMutation.error,
  };
};
