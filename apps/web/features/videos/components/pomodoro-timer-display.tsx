"use client";

import { cn } from "@/lib/utils";
import type { PomodoroPhase, PomodoroStatus } from "@/features/pomodoro/types";

type PomodoroTimerDisplayProps = {
  status: PomodoroStatus;
  timeRemaining: number;
  currentPhase: PomodoroPhase;
};

export const PomodoroTimerDisplay = ({
  status,
  timeRemaining,
  currentPhase,
}: PomodoroTimerDisplayProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPhaseLabel = (phase: PomodoroPhase) => {
    switch (phase) {
      case "work":
        return "Focus";
      case "short-break":
        return "Break";
      case "long-break":
        return "Long Break";
      default:
        return "Focus";
    }
  };

  const getPhaseColor = (phase: PomodoroPhase) => {
    switch (phase) {
      case "work":
        return "text-red-600 dark:text-red-400";
      case "short-break":
        return "text-green-600 dark:text-green-400";
      case "long-break":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out",
        "bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20",
        "backdrop-blur-md border-2 border-primary/40 dark:border-primary/60",
        "rounded-2xl shadow-2xl shadow-primary/20 dark:shadow-primary/40",
        "px-4 py-3 min-w-[120px] text-center",
        "hover:scale-105 hover:shadow-3xl hover:border-primary/60",
        status === "running" && "animate-pulse",
        status === "paused" && "opacity-80",
      )}
    >
      <div className="flex flex-col items-center space-y-1">
        {/* Phase indicator */}
        <div
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            "text-primary dark:text-primary-foreground",
            getPhaseColor(currentPhase),
          )}
        >
          {getPhaseLabel(currentPhase)}
        </div>

        {/* Timer display */}
        <div
          className={cn(
            "text-lg font-bold tabular-nums",
            "text-foreground dark:text-white",
            "drop-shadow-sm",
          )}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Status indicator */}
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            status === "running"
              ? "bg-green-500 animate-pulse"
              : "bg-yellow-500",
          )}
        />
      </div>
    </div>
  );
};
