"use client";

import { usePomodoroStore } from "../store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  SkipForward,
  X,
  Timer,
} from "lucide-react";
import { PomodoroSettings } from "./pomodoro-settings";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getPhaseLabel = (phase: string) => {
  switch (phase) {
    case "work":
      return "Focus Time";
    case "short-break":
      return "Short Break";
    case "long-break":
      return "Long Break";
    default:
      return "Focus Time";
  }
};

export const PomodoroTimer = () => {
  const {
    currentPhase,
    status,
    timeRemaining,
    totalTime,
    completedPomodoros,
    isSettingsOpen,
    toggleSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    disablePomodoro,
    focusModeEnabled,
  } = usePomodoroStore();

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card
        className={cn(
          "shadow-xl border backdrop-blur-sm transition-all duration-500",
          focusModeEnabled
            ? [
                "bg-background/95 border-neutral-sage/40",
                "shadow-2xl shadow-neutral-sage/20",
                "pomodoro-timer-glow",
                "ring-1 ring-neutral-sage/30",
              ]
            : ["bg-card border-border", "text-card-foreground"],
        )}
      >
        <CardContent className="p-3">
          {/* Compact Layout */}
          <div className="flex items-center gap-4 min-w-[380px]">
            {/* Timer Display with Mini Progress */}
            <div className="flex items-center gap-3">
              {/* Mini Progress Ring */}
              <div className="relative w-12 h-12">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className={cn(
                      focusModeEnabled
                        ? "text-neutral-sage/20"
                        : "text-muted/20",
                    )}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                    className={cn(
                      "transition-all duration-1000 ease-linear",
                      currentPhase === "work" &&
                        (focusModeEnabled
                          ? "text-emerald-400"
                          : "text-emerald-500"),
                      currentPhase === "short-break" &&
                        (focusModeEnabled ? "text-blue-400" : "text-blue-500"),
                      currentPhase === "long-break" &&
                        (focusModeEnabled
                          ? "text-purple-400"
                          : "text-purple-500"),
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Timer
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      focusModeEnabled
                        ? "text-neutral-sage-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
              </div>

              {/* Timer and Phase */}
              <div className="flex flex-col">
                <div
                  className={cn(
                    "text-2xl font-mono font-bold tabular-nums transition-colors duration-300",
                    focusModeEnabled ? "focus-text-primary" : "text-foreground",
                  )}
                >
                  {formatTime(timeRemaining)}
                </div>
                <div
                  className={cn(
                    "text-xs transition-colors duration-300",
                    focusModeEnabled
                      ? "focus-text-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  {getPhaseLabel(currentPhase)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className={cn(
                "h-8 w-px transition-colors duration-300",
                focusModeEnabled ? "bg-neutral-sage/30" : "bg-border",
              )}
            ></div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={status === "running" ? pauseTimer : startTimer}
                size="sm"
                className={cn(
                  "h-8 px-4 text-sm font-medium transition-all duration-200",
                  status === "running"
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    : cn(
                        focusModeEnabled && "focus-button",
                        currentPhase === "work" &&
                          "bg-emerald-600 hover:bg-emerald-700 text-white",
                        currentPhase === "short-break" &&
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        currentPhase === "long-break" &&
                          "bg-purple-600 hover:bg-purple-700 text-white",
                      ),
                )}
              >
                {status === "running" ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    {status === "paused" ? "Resume" : "Start"}
                  </>
                )}
              </Button>

              <Button
                onClick={skipPhase}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs transition-all duration-200",
                  focusModeEnabled && [
                    "border-neutral-sage/40 bg-background/80",
                    "hover:bg-neutral-sage/20 hover:border-neutral-sage/60",
                  ],
                )}
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Skip
              </Button>
            </div>

            {/* Divider */}
            <div
              className={cn(
                "h-8 w-px transition-colors duration-300",
                focusModeEnabled ? "bg-neutral-sage/30" : "bg-border",
              )}
            ></div>

            {/* Session Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="text-lg">🍅</div>
                <div className="flex flex-col">
                  <div
                    className={cn(
                      "text-sm font-semibold transition-colors duration-300",
                      focusModeEnabled
                        ? "focus-text-primary"
                        : "text-foreground",
                    )}
                  >
                    {completedPomodoros}
                  </div>
                  <div
                    className={cn(
                      "text-xs transition-colors duration-300",
                      focusModeEnabled
                        ? "focus-text-secondary"
                        : "text-muted-foreground",
                    )}
                  >
                    sessions
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className={cn(
                "h-8 w-px transition-colors duration-300",
                focusModeEnabled ? "bg-neutral-sage/30" : "bg-border",
              )}
            ></div>

            {/* Settings & Exit */}
            <div className="flex items-center gap-1">
              <Popover open={isSettingsOpen} onOpenChange={toggleSettings}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200",
                      focusModeEnabled && [
                        "border-neutral-sage/40 bg-background/80",
                        "hover:bg-neutral-sage/20 hover:border-neutral-sage/60",
                      ],
                    )}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[600px] p-0"
                  align="center"
                  side="top"
                  sideOffset={10}
                >
                  <PomodoroSettings />
                </PopoverContent>
              </Popover>

              <Button
                onClick={disablePomodoro}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-all duration-200",
                  focusModeEnabled
                    ? [
                        "border-destructive/40 bg-background/80 text-destructive",
                        "hover:bg-destructive/20 hover:border-destructive/60",
                      ]
                    : ["hover:bg-destructive/10 hover:border-destructive/20"],
                )}
                title="Exit Focus Mode"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
