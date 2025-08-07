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
        'fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full',
        'bg-background border-2 border-border',
        isDialogOpen ? 'border-primary' : '',
      )}
      variant="outline"
    >
      {isDialogOpen ? (
        <EyeOff className="h-6 w-6 text-muted-foreground" />
      ) : (
        <Timer className="h-6 w-6 text-primary" />
      )}
      <span className="sr-only">Toggle Pomodoro</span>
    </Button>
  );
};
