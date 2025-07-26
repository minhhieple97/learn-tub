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
import { Timer, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { initializeYouTubeAPI, setCurrentVideo } = useNotesStore();
  const { setVideoContext } = useQuizStore();
  const { focusModeEnabled, isEnabled, isDialogOpen, toggleDialog, resetAll } =
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
  }, [initializeYouTubeAPI, setCurrentVideo, video, setVideoContext]);

  useEffect(() => {
    initializeVideo();
  }, [initializeVideo]);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

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
      <Button
        onClick={toggleDialog}
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-500 ease-out",
          // Dark/Light mode adaptive background
          "bg-background/90 dark:bg-black/90 backdrop-blur-sm",
          // Dark/Light mode adaptive border
          "border-2 border-border/50 dark:border-white/20",
          // Hover effects
          "hover:shadow-3xl hover:scale-110 hover:border-primary/70 hover:rotate-12",
          "active:scale-95 active:rotate-0",
          // State-based styling
          isDialogOpen
            ? "animate-pulse border-primary/60 shadow-primary/30 rotate-180 scale-105"
            : "hover:animate-none animate-bounce",
          // Hide when Pomodoro is running to avoid interference
          isEnabled && "opacity-30 pointer-events-none",
        )}
        variant="outline"
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isDialogOpen ? "rotate-180 scale-90" : "rotate-0 scale-100",
          )}
        >
          {isDialogOpen ? (
            <EyeOff className="h-7 w-7 text-muted-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-colors duration-200" />
          ) : (
            <Timer className="h-7 w-7 text-primary hover:text-primary/80 transition-colors duration-200" />
          )}
        </div>
        <span className="sr-only">Toggle Pomodoro</span>
      </Button>
    </div>
  );
};
