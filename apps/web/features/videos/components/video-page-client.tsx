"use client";

import { cn } from "@/lib/utils";
import { useVideoPage } from "../hooks/use-video-page";
import { VideoLayout } from "./video-layout";
import { PomodoroControl } from "./pomodoro-control";
import {
  PomodoroTimer,
  PomodoroSimpleDialog,
} from "@/features/pomodoro/components";
import type { IVideoPageData } from "../types";

type IVideoPageClientProps = {
  video: IVideoPageData;
};

export const VideoPageClient = ({ video }: IVideoPageClientProps) => {
  const { focusModeEnabled, pomodoro } = useVideoPage(video);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        focusModeEnabled && "focus-workspace",
      )}
    >
      <VideoLayout focusModeEnabled={focusModeEnabled} />

      {/* Pomodoro Components */}
      <PomodoroSimpleDialog />
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
