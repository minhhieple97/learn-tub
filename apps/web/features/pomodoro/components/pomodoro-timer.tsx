"use client";

import { usePomodoroStore } from "../store";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  SkipForward,
  Coffee,
  Brain,
  Timer
} from "lucide-react";
import { PomodoroSettings } from "./pomodoro-settings";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getPhaseIcon = (phase: string) => {
  switch (phase) {
    case "work":
      return <Brain className="h-4 w-4" />;
    case "short-break":
      return <Coffee className="h-4 w-4" />;
    case "long-break":
      return <Timer className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
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

const getPhaseColor = (phase: string) => {
  switch (phase) {
    case "work":
      return "bg-neutral-sage text-neutral-sage-foreground";
    case "short-break":
      return "bg-neutral-mist text-neutral-mist-foreground";
    case "long-break":
      return "bg-neutral-clay text-neutral-clay-foreground";
    default:
      return "bg-neutral-sage text-neutral-sage-foreground";
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
  } = usePomodoroStore();

  // Play sound when phase completes
  const playNotificationSound = () => {
    if (typeof window !== 'undefined') {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // High pitch notification
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="shadow-xl border bg-card text-card-foreground backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Modern Landscape Layout */}
          <div className="flex items-center gap-6 min-w-[450px]">
            {/* Timer Display */}
            <div className="flex flex-col items-center">
              <div className="text-5xl font-mono font-bold text-foreground mb-2 tabular-nums">
                {formatTime(timeRemaining)}
              </div>

              {/* Progress Ring */}
              <div className="relative w-24 h-24 mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={cn(
                      'transition-all duration-1000 ease-linear',
                      currentPhase === 'work' && 'text-emerald-500',
                      currentPhase === 'short-break' && 'text-blue-500',
                      currentPhase === 'long-break' && 'text-purple-500',
                    )}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Phase Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      'p-2 rounded-full text-lg',
                      currentPhase === 'work' &&
                        'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                      currentPhase === 'short-break' &&
                        'bg-blue-500/20 text-blue-600 dark:text-blue-400',
                      currentPhase === 'long-break' &&
                        'bg-purple-500/20 text-purple-600 dark:text-purple-400',
                    )}
                  >
                    {getPhaseIcon(currentPhase)}
                  </div>
                </div>
              </div>

              {/* Phase Badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  currentPhase === 'work' &&
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
                  currentPhase === 'short-break' &&
                    'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
                  currentPhase === 'long-break' &&
                    'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20',
                )}
              >
                {getPhaseIcon(currentPhase)}
                {getPhaseLabel(currentPhase)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              {/* Primary Action - Start/Pause Button */}
              <Button
                onClick={status === 'running' ? pauseTimer : startTimer}
                size="lg"
                className={cn(
                  'min-w-[140px] h-12 text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl',
                  status === 'running'
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground hover:scale-105'
                    : cn(
                        'hover:scale-105',
                        currentPhase === 'work' &&
                          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
                        currentPhase === 'short-break' &&
                          'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
                        currentPhase === 'long-break' &&
                          'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
                      ),
                )}
              >
                {status === 'running' ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    {status === 'paused' ? 'Resume' : 'Start Focus'}
                  </>
                )}
              </Button>

              {/* Secondary Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  onClick={skipPhase}
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted transition-colors flex-1"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>

                <Popover open={isSettingsOpen} onOpenChange={toggleSettings}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="center" side="top" sideOffset={10}>
                    <PomodoroSettings />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Session Info */}
            <div className="flex flex-col items-center text-center space-y-2">
              {/* Pomodoro Counter */}
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-1">🍅</div>
                <div className="text-lg font-bold text-foreground">{completedPomodoros}</div>
                <div className="text-xs text-muted-foreground">completed</div>
              </div>

              {/* Status Text */}
              <div
                className={cn(
                  'px-3 py-2 rounded-full text-xs font-medium transition-colors',
                  status === 'running' &&
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  status === 'paused' && 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
                  status === 'idle' && 'bg-muted text-muted-foreground',
                )}
              >
                {status === 'running' && 'Stay focused! 🎯'}
                {status === 'paused' && 'Timer paused ⏸️'}
                {status === 'idle' && 'Ready to start ✨'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 