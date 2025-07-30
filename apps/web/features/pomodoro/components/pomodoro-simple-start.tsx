"use client";

import { usePomodoroStore } from "../store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Settings, Timer } from "lucide-react";
import { PomodoroSettings } from "./pomodoro-settings";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const PomodoroSimpleStart = () => {
  const { settings, enablePomodoro, isSettingsOpen, toggleSettings } =
    usePomodoroStore();

  const handleStartPomodoro = () => {
    enablePomodoro();
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="shadow-xl border bg-card text-card-foreground backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Simple Start Layout */}
          <div className="flex items-center gap-4 min-w-[320px]">
            {/* Pomodoro Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-neutral-sage/20 rounded-full">
                <Timer className="h-6 w-6 text-neutral-sage-foreground" />
              </div>

              <div className="flex flex-col">
                <div className="text-lg font-semibold text-foreground">
                  {formatTime(settings.workDuration * 60)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Focus Session
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-border"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Start Button */}
              <Button
                onClick={handleStartPomodoro}
                size="lg"
                className="bg-neutral-sage hover:bg-neutral-sage/80 text-neutral-sage-foreground shadow-neutral-sage/25 hover:shadow-xl hover:scale-105 transition-all duration-200 min-w-[120px]"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Focus
              </Button>

              {/* Settings Button */}
              <Popover open={isSettingsOpen} onOpenChange={toggleSettings}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-neutral-mist hover:bg-neutral-mist/80 border-neutral-mist text-neutral-mist-foreground hover:text-neutral-mist-foreground transition-colors"
                  >
                    <Settings className="h-5 w-5" />
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
            </div>

            {/* Quick Info */}
            <div className="flex flex-col items-center text-center">
              <div className="text-xl mb-1">🍅</div>
              <div className="text-xs text-muted-foreground">
                Ready to focus
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
