"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  IPomodoroState,
  IPomodoroActions,
  IPomodoroSettings,
  PomodoroPhase,
  PomodoroStatus,
} from "../types";

const DEFAULT_SETTINGS: IPomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  enableSounds: true,
};

type IPomodoroStore = IPomodoroState & IPomodoroActions;

export const usePomodoroStore = create<IPomodoroStore>()(
  devtools(
    (set, get) => {
      // Cleanup timer on page unload
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
          }
        });
      }

      const calculateTimeForPhase = (
        phase: PomodoroPhase,
        settings: IPomodoroSettings,
      ): number => {
        switch (phase) {
          case "work":
            return settings.workDuration * 60;
          case "short-break":
            return settings.shortBreakDuration * 60;
          case "long-break":
            return settings.longBreakDuration * 60;
          default:
            return settings.workDuration * 60;
        }
      };

      const getNextPhase = (
        currentPhase: PomodoroPhase,
        completedPomodoros: number,
        longBreakInterval: number,
      ): PomodoroPhase => {
        if (currentPhase === "work") {
          // After work, check if it's time for a long break
          return (completedPomodoros + 1) % longBreakInterval === 0
            ? "long-break"
            : "short-break";
        }
        // After any break, return to work
        return "work";
      };

      const moveToNextPhase = () => {
        const { currentPhase, completedPomodoros, settings, focusModeEnabled } =
          get();
        const nextPhase = getNextPhase(
          currentPhase,
          completedPomodoros,
          settings.longBreakInterval,
        );
        const nextTime = calculateTimeForPhase(nextPhase, settings);

        const newCompletedPomodoros =
          currentPhase === "work" ? completedPomodoros + 1 : completedPomodoros;
        const newCycle =
          currentPhase === "long-break"
            ? Math.floor(newCompletedPomodoros / settings.longBreakInterval)
            : Math.floor(newCompletedPomodoros / settings.longBreakInterval);

        set({
          currentPhase: nextPhase,
          timeRemaining: nextTime,
          totalTime: nextTime,
          completedPomodoros: newCompletedPomodoros,
          currentCycle: newCycle,
          status: "idle" as PomodoroStatus,
        });

        // Auto-start next phase if enabled
        const shouldAutoStart =
          nextPhase === "work"
            ? settings.autoStartPomodoros
            : settings.autoStartBreaks;
        if (shouldAutoStart && focusModeEnabled) {
          // Small delay to let the user see the phase change
          setTimeout(() => {
            get().startTimer();
          }, 1000);
        }

        // Play notification sound if enabled
        if (settings.enableSounds && typeof window !== "undefined") {
          // Create notification sound
          try {
            const audioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different tones for different phases
            oscillator.frequency.value = nextPhase === "work" ? 600 : 800;
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
              0.3,
              audioContext.currentTime + 0.1,
            );
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioContext.currentTime + 0.8,
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);

            console.log(
              `🍅 ${nextPhase === "work" ? "Time to focus!" : "Time for a break!"}`,
            );
          } catch (error) {
            console.log(
              `🍅 ${nextPhase === "work" ? "Time to focus!" : "Time for a break!"}`,
            );
          }
        }
      };

      return {
        // Initial state
        isEnabled: false,
        currentPhase: "work" as PomodoroPhase,
        status: "idle" as PomodoroStatus,
        timeRemaining: DEFAULT_SETTINGS.workDuration * 60,
        totalTime: DEFAULT_SETTINGS.workDuration * 60,
        startTime: null,
        timerInterval: null,
        completedPomodoros: 0,
        currentCycle: 0,
        isSettingsOpen: false,
        focusModeEnabled: false,
        settings: DEFAULT_SETTINGS,

        // Timer controls
        startTimer: () => {
          const { timerInterval, timeRemaining } = get();

          // Clear existing timer
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          const startTime =
            Date.now() - (get().totalTime - timeRemaining) * 1000;
          set({
            status: "running" as PomodoroStatus,
            startTime,
          });

          const interval = setInterval(() => {
            set((state) => {
              if (state.startTime && state.status === "running") {
                const elapsed = Math.floor(
                  (Date.now() - state.startTime) / 1000,
                );
                const remaining = Math.max(0, state.totalTime - elapsed);

                if (remaining === 0) {
                  // Timer completed
                  clearInterval(interval);
                  moveToNextPhase();
                  return {
                    timerInterval: null,
                    status: "completed" as PomodoroStatus,
                    startTime: null,
                  };
                }

                return { timeRemaining: remaining };
              }
              return state;
            });
          }, 1000);

          set({ timerInterval: interval });
        },

        pauseTimer: () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
            set({
              timerInterval: null,
              status: "paused" as PomodoroStatus,
              startTime: null,
            });
          }
        },

        resetTimer: () => {
          const { timerInterval, currentPhase, settings } = get();

          if (timerInterval) {
            clearInterval(timerInterval);
          }

          const resetTime = calculateTimeForPhase(currentPhase, settings);

          set({
            timerInterval: null,
            status: "idle" as PomodoroStatus,
            timeRemaining: resetTime,
            totalTime: resetTime,
            startTime: null,
          });
        },

        skipPhase: () => {
          const { timerInterval } = get();

          if (timerInterval) {
            clearInterval(timerInterval);
            set({ timerInterval: null });
          }

          moveToNextPhase();
        },

        // Settings
        updateSettings: (newSettings: Partial<IPomodoroSettings>) => {
          set((state) => {
            const updatedSettings = { ...state.settings, ...newSettings };
            const newTime = calculateTimeForPhase(
              state.currentPhase,
              updatedSettings,
            );

            // If timer is idle, update the time
            const updates: Partial<IPomodoroState> = {
              settings: updatedSettings,
            };

            if (state.status === "idle") {
              updates.timeRemaining = newTime;
              updates.totalTime = newTime;
            }

            return updates;
          });
        },

        toggleSettings: () => {
          set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
        },

        // Focus mode
        enablePomodoro: () => {
          set({
            isEnabled: true,
            focusModeEnabled: true,
          });
        },

        disablePomodoro: () => {
          const { timerInterval } = get();

          if (timerInterval) {
            clearInterval(timerInterval);
          }

          set({
            isEnabled: false,
            focusModeEnabled: false,
            timerInterval: null,
            status: "idle" as PomodoroStatus,
            startTime: null,
          });
        },

        toggleFocusMode: () => {
          set((state) => ({ focusModeEnabled: !state.focusModeEnabled }));
        },

        // Reset everything (for page navigation)
        resetAll: () => {
          const { timerInterval } = get();

          if (timerInterval) {
            clearInterval(timerInterval);
          }

          set({
            isEnabled: false,
            currentPhase: "work" as PomodoroPhase,
            status: "idle" as PomodoroStatus,
            timeRemaining: DEFAULT_SETTINGS.workDuration * 60,
            totalTime: DEFAULT_SETTINGS.workDuration * 60,
            startTime: null,
            timerInterval: null,
            completedPomodoros: 0,
            currentCycle: 0,
            isSettingsOpen: false,
            focusModeEnabled: false,
            settings: DEFAULT_SETTINGS,
          });
        },
      };
    },
    { name: "pomodoro-store" },
  ),
);
