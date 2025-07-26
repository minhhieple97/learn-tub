"use client";

import { useEffect, useCallback } from "react";
import { useNotesStore } from "@/features/notes/store";
import { VideoPageHeader } from "./video-page-header";
import { VideoMainContent } from "./video-main-content";
import { VideoSidebar } from "./video-sidebar";
import { ResizablePanels } from "./resizable-panels";
import { IVideoPageData } from "../types";
import { useQuizStore } from "@/features/quizzes/store";
import { usePomodoroStore } from "@/features/pomodoro/store";
import {
  PomodoroTimer,
  PomodoroSimpleDialog,
} from "@/features/pomodoro/components";
import { Button } from "@/components/ui/button";
import { Timer, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { initializeYouTubeAPI, setCurrentVideo } = useNotesStore();
  const { setVideoContext } = useQuizStore();
  const { focusModeEnabled, isEnabled, isDialogOpen, toggleDialog } =
    usePomodoroStore();

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
  }, [
    video.id,
    video.title,
    video.description,
    video.tutorial,
    initializeYouTubeAPI,
    setCurrentVideo,
    setVideoContext,
  ]);

  useEffect(() => {
    initializeVideo();
  }, [initializeVideo]);

  // useEffect(() => {
  //   return () => {
  //     resetAll();
  //   };
  // }, [resetAll]);

  const leftPanel = <VideoMainContent />;
  const rightPanel = <VideoSidebar />;

  return (
    <div
      className={cn(
        "space-y-6 transition-all duration-300",
        focusModeEnabled && "focus-workspace",
      )}
    >
      <div
        className={cn(
          "transition-all duration-300",
          focusModeEnabled && "focus-mode-highlight",
        )}
      >
        <VideoPageHeader />
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          focusModeEnabled && "focus-mode-highlight",
        )}
      >
        <ResizablePanels
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          initialLeftWidth={66.666667}
          minLeftWidth={30}
          maxLeftWidth={80}
        />
      </div>

      {/* Pomodoro Components */}
      <PomodoroSimpleDialog />
      {isEnabled && <PomodoroTimer />}

      {/* Pomodoro Toggle Button - Fixed Bottom Right */}
      {!isEnabled && (
        <Button
          onClick={toggleDialog}
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-black/90 backdrop-blur-sm border-2 border-white/20 hover:border-primary/70"
          variant="outline"
        >
          {isDialogOpen ? (
            <EyeOff className="h-7 w-7 text-white/80 hover:text-white transition-colors" />
          ) : (
            <Timer className="h-7 w-7 text-primary hover:text-primary/80 transition-colors" />
          )}
          <span className="sr-only">Toggle Pomodoro</span>
        </Button>
      )}
    </div>
  );
};
