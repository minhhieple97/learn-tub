"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Timer, Play, Pause, ArrowLeft } from "lucide-react";
import { usePomodoroStore } from "../store";
import { PomodoroSettings } from "./pomodoro-settings";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const PomodoroSimpleDialog = () => {
  const {
    isDialogOpen,
    closeDialog,
    enablePomodoro,
    startTimer,
    pauseTimer,
    timeRemaining,
    status,
    completedPomodoros,
    currentPhase,
  } = usePomodoroStore();

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleStartPomodoro = () => {
    enablePomodoro();
    closeDialog();
  };

  const handleShowSettings = () => {
    setShowAdvancedSettings(true);
  };

  const handleBackToSimple = () => {
    setShowAdvancedSettings(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent
        className={cn(
          "border-border/50 bg-black/90 backdrop-blur-sm",
          showAdvancedSettings ? "sm:max-w-[500px]" : "sm:max-w-xl",
        )}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg text-white">
            {showAdvancedSettings ? (
              <>
                <Button
                  onClick={handleBackToSimple}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Timer className="h-5 w-5 text-primary" />
                Pomodoro Settings
              </>
            ) : (
              <>
                <Timer className="h-5 w-5 text-primary" />
                Focus Session
              </>
            )}
          </DialogTitle>
          {showAdvancedSettings && (
            <DialogDescription className="text-gray-300">
              Configure your focus sessions and break durations. Use the
              Pomodoro Technique to boost your productivity while learning.
            </DialogDescription>
          )}
        </DialogHeader>

        {showAdvancedSettings ? (
          /* Advanced Settings View */
          <>
            <div className="py-4">
              <PomodoroSettings />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border/50">
              <Button
                onClick={closeDialog}
                variant="outline"
                className="flex-1 border-border hover:bg-muted hover:border-muted-foreground/20 text-white"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleStartPomodoro}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Pomodoro
              </Button>
            </div>
          </>
        ) : (
          /* Simple View */
          <>
            {/* Simplified Horizontal Layout */}
            <div className="flex items-center justify-between gap-6 py-3">
              {/* Timer Display */}
              <div className="flex flex-col items-center">
                <div className="text-4xl font-mono font-bold text-white mb-1 tabular-nums">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {currentPhase.replace("-", " ")}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={status === "running" ? pauseTimer : startTimer}
                  size="lg"
                  className={cn(
                    "h-11 px-6 font-medium transition-all duration-200 shadow-sm",
                    status === "running"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive/20"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20",
                  )}
                >
                  {status === "running" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {status === "paused" ? "Resume" : "Start"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleShowSettings}
                  variant="outline"
                  size="lg"
                  className="h-11 w-11 p-0 border-border hover:bg-white/10 hover:border-white/20"
                >
                  <Settings className="h-4 w-4 text-gray-300" />
                </Button>
              </div>

              {/* Session Info */}
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-1">🍅</div>
                <div className="text-sm font-semibold text-white">
                  {completedPomodoros}
                </div>
                <div className="text-xs text-gray-400">sessions</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-border/50">
              <Button
                onClick={closeDialog}
                variant="outline"
                className="flex-1 border-border hover:bg-white/10 hover:border-white/20 text-white"
              >
                Later
              </Button>
              <Button
                onClick={handleStartPomodoro}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Enable Pomodoro
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
