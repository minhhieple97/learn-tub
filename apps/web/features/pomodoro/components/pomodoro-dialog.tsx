"use client";

import { useState, useEffect } from "react";
import { usePomodoroStore } from "../store";
import { PomodoroSettings } from "./pomodoro-settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Timer, Play } from "lucide-react";

export const PomodoroDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnabled, enablePomodoro } = usePomodoroStore();

  // Show dialog by default when component mounts (user visits page)
  useEffect(() => {
    if (!isEnabled) {
      setIsOpen(true);
    }
  }, [isEnabled]);

  const handleEnablePomodoro = () => {
    enablePomodoro();
    setIsOpen(false);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Timer className="h-6 w-6" />
            Pomodoro Timer
          </DialogTitle>
          <DialogDescription>
            Configure your focus sessions and break durations. Use the Pomodoro
            Technique to boost your productivity while learning.
          </DialogDescription>
        </DialogHeader>

        {/* Pomodoro Settings */}
        <div className="py-4">
          <PomodoroSettings />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleEnablePomodoro}
            className="flex-1 bg-neutral-sage hover:bg-neutral-sage/80 text-neutral-sage-foreground"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Pomodoro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
