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
    <div
      className={cn('space-y-6 transition-all duration-300', focusModeEnabled && 'relative z-10')}
    >
      <div
        className={cn(
          'transition-all duration-300 rounded-lg',
          focusModeEnabled
            ? [
                'bg-background/95 backdrop-blur-sm border border-neutral-sage/30',
                'shadow-lg shadow-neutral-sage/10',
                'focus-mode-highlight',
              ]
            : 'bg-transparent',
        )}
      >
        <VideoPageHeader />
      </div>

      <div
        className={cn(
          'transition-all duration-300 rounded-lg',
          focusModeEnabled
            ? [
                'bg-background/95 backdrop-blur-sm border border-neutral-sage/30',
                'shadow-xl shadow-neutral-sage/15',
                'focus-mode-highlight',
                'pomodoro-timer-glow',
              ]
            : 'bg-transparent',
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
