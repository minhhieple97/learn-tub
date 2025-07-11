"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/features/notes/store";
import { VideoPageHeader } from "./video-page-header";
import { VideoMainContent } from "./video-main-content";
import { VideoSidebar } from "./video-sidebar";
import { ResizablePanels } from "./resizable-panels";
import { IVideoPageData } from "../types";
import { useQuizStore } from "@/features/quizzes/store";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { initializeYouTubeAPI, setCurrentVideo } = useNotesStore();

  const { setVideoContext } = useQuizStore();

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

  const leftPanel = <VideoMainContent />;

  const rightPanel = <VideoSidebar />;

  return (
    <div className="space-y-6">
      <VideoPageHeader />

      <ResizablePanels
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        initialLeftWidth={66.666667}
        minLeftWidth={30}
        maxLeftWidth={80}
      />
    </div>
  );
};
