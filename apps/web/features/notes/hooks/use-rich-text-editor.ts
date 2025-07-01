"use client";

import { useNotesStore } from "../store";
import { IUseRichTextEditorHookReturn } from "../types";

export const useRichTextEditor = (): IUseRichTextEditorHookReturn => {
  const {
    formContent,
    currentVideoId,
    isFormLoading,
    youtubePlayer,
    setYouTubePlayer,
  } = useNotesStore();

  const setVideoElementRef = (player: any) => {
    setYouTubePlayer(player);
  };

  return {
    content: formContent,
    disabled: isFormLoading,
    videoElement: youtubePlayer,
    setVideoElementRef,
    videoId: currentVideoId || "",
    isLoading: isFormLoading,
    isReady: Boolean(currentVideoId && youtubePlayer),
  };
};
