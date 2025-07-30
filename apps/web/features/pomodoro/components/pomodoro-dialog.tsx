"use client";

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
  const { isDialogOpen, enablePomodoro, closeDialog } = usePomodoroStore();

  const handleEnablePomodoro = () => {
    enablePomodoro();
    closeDialog();
  };

  const handleCloseDialog = () => {
    closeDialog();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="border-4 border-primary bg-black/90 backdrop-blur-sm sm:max-w-[500px] shadow-2xl shadow-primary/40 ring-2 ring-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Timer className="h-6 w-6 text-primary" />
            Pomodoro Timer
          </DialogTitle>
          <DialogDescription className="text-gray-300">
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
            className="flex-1 bg-neutral-stone hover:bg-neutral-stone/80 border-neutral-stone text-neutral-stone-foreground hover:text-neutral-stone-foreground"
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
