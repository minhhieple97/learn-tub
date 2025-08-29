"use client";

import { cn } from "@/lib/utils";
import { useVideoPage } from "../hooks/use-video-page";
import { VideoLayout } from "./video-layout";
import { PomodoroControl } from "./pomodoro-control";
import { PomodoroTimer, PomodoroDialog } from "@/features/pomodoro/components";
import type { IVideoPageData } from "../types";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { focusModeEnabled, pomodoro } = useVideoPage(video);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out",
        focusModeEnabled && ["min-h-screen"],
      )}
    >
      <VideoLayout focusModeEnabled={focusModeEnabled} />

      {/* Pomodoro Components */}
      <PomodoroDialog />
      {pomodoro.isEnabled && <PomodoroTimer />}

      {/* Pomodoro Control - Fixed Bottom Right */}
      <PomodoroControl
        isEnabled={pomodoro.isEnabled}
        isDialogOpen={pomodoro.isDialogOpen}
        status={pomodoro.status}
        timeRemaining={pomodoro.timeRemaining}
        currentPhase={pomodoro.currentPhase}
        onToggleDialog={pomodoro.toggleDialog}
      />
    </div>
  );
};
