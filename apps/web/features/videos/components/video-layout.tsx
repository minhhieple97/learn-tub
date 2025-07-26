"use client";

import { cn } from "@/lib/utils";
import { VideoPageHeader } from "./video-page-header";
import { VideoMainContent } from "./video-main-content";
import { VideoSidebar } from "./video-sidebar";
import { ResizablePanels } from "./resizable-panels";

type VideoLayoutProps = {
  focusModeEnabled: boolean;
};

export const VideoLayout = ({ focusModeEnabled }: VideoLayoutProps) => {
  const leftPanel = <VideoMainContent />;
  const rightPanel = <VideoSidebar />;

  return (
    <div className="space-y-6">
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
    </div>
  );
};
