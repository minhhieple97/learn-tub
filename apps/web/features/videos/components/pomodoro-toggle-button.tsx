"use client";

import { Button } from "@/components/ui/button";
import { Timer, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PomodoroToggleButtonProps = {
  isDialogOpen: boolean;
  onToggle: () => void;
};

export const PomodoroToggleButton = ({
  isDialogOpen,
  onToggle,
}: PomodoroToggleButtonProps) => {
  return (
    <Button
      onClick={onToggle}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-500 ease-out",
        // Dark/Light mode adaptive background
        "bg-background/90 dark:bg-black/90 backdrop-blur-sm",
        // Dark/Light mode adaptive border
        "border-2 border-border/50 dark:border-white/20",
        // Hover effects
        "hover:shadow-3xl hover:scale-110 hover:border-primary/70 hover:rotate-12",
        "active:scale-95 active:rotate-0",
        // State-based styling
        isDialogOpen
          ? "animate-pulse border-primary/60 shadow-primary/30 rotate-180 scale-105"
          : "hover:animate-none animate-bounce"
      )}
      variant="outline"
    >
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isDialogOpen ? "rotate-180 scale-90" : "rotate-0 scale-100"
        )}
      >
        {isDialogOpen ? (
          <EyeOff className="h-7 w-7 text-muted-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-colors duration-200" />
        ) : (
          <Timer className="h-7 w-7 text-primary hover:text-primary/80 transition-colors duration-200" />
        )}
      </div>
      <span className="sr-only">Toggle Pomodoro</span>
    </Button>
  );
};