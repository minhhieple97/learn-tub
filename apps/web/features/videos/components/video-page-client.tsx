"use client";

import { useVideoPlayer } from "@/features/videos/hooks/use-video-player";
import { VideoPageHeader } from "./video-page-header";
import { VideoMainContent } from "./video-main-content";
import { VideoSidebar } from "./video-sidebar";
import { ResizablePanels } from "./resizable-panels";
import { IVideoPageData } from "../types";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { currentTimestamp, targetSeekTime, handleTimeUpdate, handleNoteTimestampClick } =
    useVideoPlayer();

  const leftPanel = (
    <VideoMainContent
      video={video}
      onTimeUpdate={handleTimeUpdate}
      targetSeekTime={targetSeekTime}
    />
  );

  const rightPanel = (
    <VideoSidebar
      video={video}
      currentTimestamp={currentTimestamp}
      onTimestampClick={handleNoteTimestampClick}
    />
  );

  return (
    <div className="space-y-6">
      <VideoPageHeader video={video} />

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
