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

export const PomodoroDialog = () => {
  const {
    isDialogOpen,
    closeDialog,
    enablePomodoro,
    disablePomodoro,
    startTimer,
    pauseTimer,
    timeRemaining,
    status,
    completedPomodoros,
    currentPhase,
    isEnabled,
  } = usePomodoroStore();

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleStartPomodoro = () => {
    enablePomodoro();
    startTimer();
    closeDialog();
  };

  const handleCancelPomodoro = () => {
    disablePomodoro();
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
          "border-4 border-primary bg-black/90 backdrop-blur-sm shadow-2xl shadow-primary/40 ring-2 ring-primary/30",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2",
          "transition-all ease-out",
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
          <div className="animate-in fade-in-0 slide-in-from-right-2 duration-200">
            <div className="py-4">
              <PomodoroSettings />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border/50">
              <Button
                onClick={closeDialog}
                variant="outline"
                className="flex-1 border-border hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200 hover:scale-105"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleStartPomodoro}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Pomodoro
              </Button>
            </div>
          </div>
        ) : (
          /* Simple View */
          <div className="animate-in fade-in-0 slide-in-from-left-2 duration-200">
            {/* Simplified Horizontal Layout */}
            <div className="flex items-center justify-between gap-6 py-3">
              {/* Timer Display */}
              <div className="flex flex-col items-center group">
                <div className="text-4xl font-mono font-bold text-white mb-1 tabular-nums transition-all duration-300 group-hover:scale-105">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide transition-colors duration-200 group-hover:text-gray-300">
                  {currentPhase.replace("-", " ")}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={
                    status === "running"
                      ? pauseTimer
                      : () => {
                          enablePomodoro();
                          startTimer();
                          closeDialog();
                        }
                  }
                  size="lg"
                  className={cn(
                    "h-11 px-6 font-medium transition-all duration-200 shadow-sm hover:scale-105 active:scale-95",
                    status === "running"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive/20"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20",
                  )}
                >
                  {status === "running" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2 transition-transform duration-200" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2 transition-transform duration-200" />
                      {status === "paused" ? "Resume" : "Start"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleShowSettings}
                  variant="outline"
                  size="lg"
                  className="h-11 w-11 p-0 border-border hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 hover:rotate-90"
                >
                  <Settings className="h-4 w-4 text-gray-300 transition-all duration-200" />
                </Button>
              </div>

              {/* Session Info */}
              <div className="flex flex-col items-center group">
                <div className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-110">
                  🍅
                </div>
                <div className="text-sm font-semibold text-white transition-all duration-200 group-hover:text-primary">
                  {completedPomodoros}
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-300">
                  sessions
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
