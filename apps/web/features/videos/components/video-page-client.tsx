"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/features/notes/store";
import { VideoPageHeader } from "./video-page-header";
import { VideoMainContent } from "./video-main-content";
import { VideoSidebar } from "./video-sidebar";
import { ResizablePanels } from "./resizable-panels";
import { IVideoPageData } from "../types";
import { useQuizStore } from "@/features/quizzes/store";
import { usePomodoroStore } from '@/features/pomodoro/store';
import { PomodoroTimer, PomodoroSimpleStart } from '@/features/pomodoro/components';
import { cn } from '@/lib/utils';

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { initializeYouTubeAPI, setCurrentVideo } = useNotesStore();
  const { setVideoContext } = useQuizStore();
  const { focusModeEnabled, resetAll, isEnabled } = usePomodoroStore();

  useEffect(() => {
    initializeYouTubeAPI();
    setCurrentVideo(video);
    setVideoContext({
      videoId: video.id,
      title: video.title,
      description: video.description,
      tutorial: video.tutorial,
    });
  }, [video, initializeYouTubeAPI, setCurrentVideo, setVideoContext]);

  // Cleanup pomodoro when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  const leftPanel = <VideoMainContent />;
  const rightPanel = <VideoSidebar />;

  return (
    <div
      className={cn('space-y-6 transition-all duration-300', focusModeEnabled && 'focus-workspace')}
    >
      <div
        className={cn('transition-all duration-300', focusModeEnabled && 'focus-mode-highlight')}
      >
        <VideoPageHeader />
      </div>

      <div
        className={cn('transition-all duration-300', focusModeEnabled && 'focus-mode-highlight')}
      >
        <ResizablePanels
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          initialLeftWidth={66.666667}
          minLeftWidth={30}
          maxLeftWidth={80}
        />
      </div>

      {/* Pomodoro UI - Shows timer when active, simple start when inactive */}
      {isEnabled ? <PomodoroTimer /> : <PomodoroSimpleStart />}
    </div>
  );
};
