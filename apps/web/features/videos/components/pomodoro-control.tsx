"use client";

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
  isDialogOpen,
  onToggleDialog,
}: PomodoroControlProps) => {
  return (
    <PomodoroToggleButton
      isDialogOpen={isDialogOpen}
      onToggle={onToggleDialog}
    />
  );
};
