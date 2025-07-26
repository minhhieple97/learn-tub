"use client";

import { useEffect, useCallback } from "react";
import { useNotesStore } from "@/features/notes/store";
import { useQuizStore } from "@/features/quizzes/store";
import { usePomodoroStore } from "@/features/pomodoro/store";
import type { IVideoPageData } from "../types";

export const useVideoPage = (video: IVideoPageData) => {
  const { initializeYouTubeAPI, setCurrentVideo } = useNotesStore();
  const { setVideoContext } = useQuizStore();
  const {
    focusModeEnabled,
    isEnabled,
    isDialogOpen,
    toggleDialog,
    resetAll,
    status,
    timeRemaining,
    currentPhase,
  } = usePomodoroStore();

  // Memoize the initialization function to prevent infinite re-renders
  const initializeVideo = useCallback(() => {
    initializeYouTubeAPI();
    setCurrentVideo(video);
    setVideoContext({
      videoId: video.id,
      title: video.title,
      description: video.description,
      tutorial: video.tutorial,
    });
  }, [initializeYouTubeAPI, setCurrentVideo, video, setVideoContext]);

  useEffect(() => {
    initializeVideo();
  }, [initializeVideo]);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  return {
    // Focus mode state
    focusModeEnabled,
    
    // Pomodoro state
    pomodoro: {
      isEnabled,
      isDialogOpen,
      status,
      timeRemaining,
      currentPhase,
      toggleDialog,
    },
  };
};