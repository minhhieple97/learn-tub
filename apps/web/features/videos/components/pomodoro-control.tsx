"use client";

import { PomodoroTimerDisplay } from "./pomodoro-timer-display";
import { PomodoroToggleButton } from "./pomodoro-toggle-button";
import type { PomodoroPhase, PomodoroStatus } from "@/features/pomodoro/types";

type PomodoroControlProps = {
  isEnabled: boolean;
  isDialogOpen: boolean;
  status: PomodoroStatus;
  timeRemaining: number;
  currentPhase: PomodoroPhase;
  onToggleDialog: () => void;
};

export const PomodoroControl = ({
  isEnabled,
  isDialogOpen,
  status,
  timeRemaining,
  currentPhase,
  onToggleDialog,
}: PomodoroControlProps) => {
  const isSessionActive =
    isEnabled && (status === "running" || status === "paused");

  if (isSessionActive) {
    return (
      <PomodoroTimerDisplay
        status={status}
        timeRemaining={timeRemaining}
        currentPhase={currentPhase}
      />
    );
  }

  return (
    <PomodoroToggleButton
      isDialogOpen={isDialogOpen}
      onToggle={onToggleDialog}
    />
  );
};
